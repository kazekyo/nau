import { Types } from '@graphql-codegen/plugin-helpers';
import {
  ArgumentNode,
  ASTNode,
  DirectiveNode,
  DocumentNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  Kind,
  OperationDefinitionNode,
  print,
  ValueNode,
  visit,
} from 'graphql';
import { encode } from 'js-base64';
import merge from 'lodash.merge';
import { getFragmentDefinitionsByDocumentFiles, getOperationDefinition } from '../utils/graphqlAST';

type ChangedFragments = { [key: string]: FragmentDefinitionNode[] };

export const ARGUMENT_DEFINITIONS_DIRECTIVE_NAME = 'argumentDefinitions';
export const ARGUMENTS_DIRECTIVE_NAME = 'arguments';

const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  const fragmentDefinitions = getFragmentDefinitionsByDocumentFiles(documentFiles);

  let changedFragments: ChangedFragments = {};
  const files = documentFiles.map((file) => {
    if (!file.document) return file;
    const result = transformDocument({ documentNode: file.document, fragmentDefinitions });
    file.document = result.documentNode;
    changedFragments = merge(changedFragments, result.changedFragments);
    return file;
  });

  return { documentFiles: replaceChangedFragments({ documentFiles: files, changedFragments }) };
};

const replaceChangedFragments = ({
  documentFiles,
  changedFragments,
}: {
  documentFiles: Types.DocumentFile[];
  changedFragments: ChangedFragments;
}): Types.DocumentFile[] => {
  Object.entries(changedFragments).forEach(([fragmentName, fragmentDefinitions]) => {
    let targetDefinitionIndex = -1;
    const targetDocumentFileIndex = documentFiles.findIndex((file) => {
      if (!file.document) return false;
      const index = file.document.definitions.findIndex((definition) => {
        return definition.kind === Kind.FRAGMENT_DEFINITION && definition.name.value === fragmentName;
      });
      if (index !== -1) targetDefinitionIndex = index;
      return index !== -1;
    });
    if (targetDocumentFileIndex === -1) return;

    const targetDocumentFile = documentFiles[targetDocumentFileIndex];
    if (!targetDocumentFile || !targetDocumentFile.document || targetDefinitionIndex === -1) return;

    const newDefinitions = [...targetDocumentFile.document.definitions];
    newDefinitions.splice(targetDefinitionIndex, 1, ...fragmentDefinitions);

    documentFiles[targetDocumentFileIndex].document = { ...targetDocumentFile.document, definitions: newDefinitions };
  });

  const files = documentFiles.map((file) => {
    if (!file.document) return file;

    // If there is only one fragment, revert to the original name as the fragment does not need the unique name.
    const replaceFunc = <T extends FragmentDefinitionNode | FragmentSpreadNode>(node: T): T => {
      const pair = getFragmentNameAndDefinitionsPair({
        targetChangedFragmentName: node.name.value,
        changedFragments,
      });
      if (pair && pair.fragmentDefinitions.length === 1) {
        return { ...node, name: { ...node.name, value: pair.originalName } };
      }
      return node;
    };
    file.document = visit(file.document, {
      FragmentSpread: {
        enter(node) {
          return replaceFunc(node);
        },
      },
      FragmentDefinition: {
        enter(node) {
          return replaceFunc(node);
        },
      },
    }) as DocumentNode;
    return file;
  });

  return files;
};

const transformDocument = ({
  documentNode,
  fragmentDefinitions,
}: {
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
}): { documentNode: DocumentNode; changedFragments: ChangedFragments } => {
  const operationDefinition = getOperationDefinition(documentNode);
  if (!operationDefinition) return { documentNode, changedFragments: {} };

  let newOperationDefinition = operationDefinition;
  const transformResult = transformFragmentSpread({
    targetDefinition: operationDefinition,
    operationDefinition,
    documentNode: documentNode,
    fragmentDefinitions,
    changedFragments: {},
  });
  newOperationDefinition = transformResult.newDefinition;

  const definitions = [
    newOperationDefinition,
    ...documentNode.definitions.filter((definition) => definition.kind !== 'OperationDefinition'),
  ];

  return { documentNode: { ...documentNode, definitions }, changedFragments: transformResult.changedFragments };
};

const getArgumentsDirective = (node: FragmentSpreadNode): DirectiveNode | undefined =>
  node.directives?.find((directiveNode) => directiveNode.name.value === ARGUMENTS_DIRECTIVE_NAME);

const getArgumentObject = ({
  argumentNodes,
}: {
  argumentNodes: readonly ArgumentNode[];
}): Record<string, ValueNode> => {
  const argumentsData: Array<[string, ValueNode]> = argumentNodes.map((argumentNode) => [
    argumentNode.name.value,
    argumentNode.value,
  ]);
  return Object.fromEntries(argumentsData);
};

const addFragmentToChangedFragment = ({
  key,
  changedFragments,
  fragmentDefinition,
}: {
  key: string;
  changedFragments: ChangedFragments;
  fragmentDefinition: FragmentDefinitionNode;
}) => {
  if (changedFragments[key]) {
    const definitions = changedFragments[key];
    if (definitions.find((definition) => definition.name.value === fragmentDefinition.name.value)) {
      return changedFragments;
    }
    definitions.push(fragmentDefinition);
  }
  changedFragments[key] = [fragmentDefinition];
  return changedFragments;
};

const transformFragmentDefinition = (params: {
  fragmentDefinition: FragmentDefinitionNode;
  operationDefinition: OperationDefinitionNode;
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  changedFragments: ChangedFragments;
  passedArguments?: Record<string, ValueNode>;
  replacedFragmentName?: string;
}): { changedFragments: ChangedFragments } => {
  const { documentNode, operationDefinition, passedArguments, fragmentDefinitions } = params;
  let currentFragmentDefinition = params.fragmentDefinition;
  let changedFragments = params.changedFragments;

  // Copy the fragment and create a fragment with the new name
  if (params.replacedFragmentName) {
    const copiedFragmentDefinition: FragmentDefinitionNode = {
      ...params.fragmentDefinition,
      name: { ...params.fragmentDefinition.name, value: params.replacedFragmentName },
    };
    currentFragmentDefinition = copiedFragmentDefinition;
  }

  const valueNodeMap: Record<string, ValueNode> = {};
  currentFragmentDefinition = visit(currentFragmentDefinition, {
    Directive: {
      enter(node) {
        if (!node.arguments || node.arguments.length === 0) return;

        if (node.name.value !== ARGUMENT_DEFINITIONS_DIRECTIVE_NAME) return;
        node.arguments.forEach((argument) => {
          if (argument.value.kind !== 'ObjectValue') return;
          const currentArgumentName = argument.name.value;
          // Put the passed arguments into valueMap to fit them where they are used in the fragment.
          if (passedArguments) {
            const passedArgumentValue = passedArguments[currentArgumentName];
            if (passedArgumentValue) {
              valueNodeMap[currentArgumentName] = passedArgumentValue;
              return;
            }
          }
        });
      },
    },
  }) as FragmentDefinitionNode;

  currentFragmentDefinition = visit(currentFragmentDefinition, {
    Argument(node) {
      if (node.value.kind === 'Variable') {
        const variableName = node.value.name.value;
        const valueNode = valueNodeMap[variableName];
        if (valueNode) {
          return { ...node, value: valueNode };
        }
      }
    },
  }) as FragmentDefinitionNode;

  const transformResult = transformFragmentSpread({
    targetDefinition: currentFragmentDefinition,
    operationDefinition,
    documentNode,
    fragmentDefinitions,
    changedFragments,
  });
  currentFragmentDefinition = transformResult.newDefinition;
  changedFragments = transformResult.changedFragments;

  addFragmentToChangedFragment({
    key: params.fragmentDefinition.name.value,
    changedFragments: params.changedFragments,
    fragmentDefinition: currentFragmentDefinition,
  });

  return { changedFragments };
};

const existsFragmentDefinitionInChangedFragments = ({
  changedFragments,
  newFragmentName,
}: {
  changedFragments: ChangedFragments;
  newFragmentName: string;
}): boolean => {
  const fragmentDefinitions = Object.entries(changedFragments)
    .map(([_, fragments]) => fragments)
    .flat();
  return !!fragmentDefinitions.find((definition) => definition.name.value === newFragmentName);
};

const getFragmentNameAndDefinitionsPair = ({
  targetChangedFragmentName,
  changedFragments,
}: {
  targetChangedFragmentName: string;
  changedFragments: ChangedFragments;
}): { originalName: string; fragmentDefinitions: FragmentDefinitionNode[] } | undefined => {
  const pair = Object.entries(changedFragments).find(([_, definitions]) => {
    return !!definitions.find((definition) => definition.name.value === targetChangedFragmentName);
  });
  if (!pair) return undefined;
  return { originalName: pair[0], fragmentDefinitions: pair[1] };
};

const transformFragmentSpread = <TDefinitionNode extends ASTNode>(params: {
  targetDefinition: TDefinitionNode;
  operationDefinition: OperationDefinitionNode;
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  changedFragments: ChangedFragments;
}): {
  changedFragments: ChangedFragments;
  newDefinition: TDefinitionNode;
} => {
  const { targetDefinition, operationDefinition, documentNode, fragmentDefinitions } = params;
  let changedFragments = params.changedFragments;
  const newDefinition = visit(targetDefinition, {
    FragmentSpread: {
      enter(node) {
        const next = getFragmentDefinition(fragmentDefinitions, node.name.value);
        if (!next) return;

        const argumentsDirective = getArgumentsDirective(node);
        if (argumentsDirective) {
          if (!argumentsDirective.arguments) return;

          const nameReplacedNode = generateNameReplacedNode({ node, argumentNodes: argumentsDirective.arguments });
          if (
            existsFragmentDefinitionInChangedFragments({
              changedFragments,
              newFragmentName: nameReplacedNode.name.value,
            })
          ) {
            return nameReplacedNode;
          }

          const result = transformFragmentDefinition({
            fragmentDefinition: next,
            documentNode,
            operationDefinition,
            changedFragments,
            fragmentDefinitions,
            passedArguments: getArgumentObject({ argumentNodes: argumentsDirective.arguments }),
            replacedFragmentName: nameReplacedNode.name.value,
          });
          changedFragments = result.changedFragments;
          return nameReplacedNode;
        } else {
          const result = transformFragmentDefinition({
            fragmentDefinition: next,
            documentNode: documentNode,
            fragmentDefinitions,
            operationDefinition,
            changedFragments,
          });
          changedFragments = result.changedFragments;
        }
      },
    },
  }) as TDefinitionNode;
  return { changedFragments, newDefinition };
};

const getFragmentDefinition = (
  fragmentDefinitions: FragmentDefinitionNode[],
  fragmentName: string,
): FragmentDefinitionNode | undefined => {
  return fragmentDefinitions.find((definition) => definition.name.value === fragmentName);
};

const generateNameReplacedNode = ({
  node,
  argumentNodes,
}: {
  node: FragmentSpreadNode;
  argumentNodes: readonly ArgumentNode[];
}): FragmentSpreadNode => {
  const name = { ...node.name, value: node.name.value + '_' + encodedArgumentsStr(argumentNodes) };
  return { ...node, name };
};

export const encodedArgumentsStr = (argumentNodes: readonly ArgumentNode[]): string => {
  const argumentsStr = [...argumentNodes]
    .sort((a, b) => a.name.value.localeCompare(b.name.value))
    .map((arg) => print(arg))
    .join(',')
    .replace(/\s+/g, '');
  return encode(argumentsStr, true);
};

export default transform;
export const exportedForTesting = {
  replaceChangedFragments,
};
