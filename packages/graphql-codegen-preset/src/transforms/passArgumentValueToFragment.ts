import { Types } from '@graphql-codegen/plugin-helpers';
import { ARGUMENTS_DIRECTIVE_NAME, ARGUMENT_DEFINITIONS_DIRECTIVE_NAME } from '@nau/core';
import {
  ArgumentNode,
  ASTNode,
  DefinitionNode,
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
import { uniq } from 'lodash';
import { getFragmentDefinitionByName, getFragmentDefinitionsByDocumentFiles } from '../utils/graphqlAST';
import { FRAGMENT_NAME_INFO_ID_1, getArgumentDefinitionDataList, getUniqueFragmentName } from './util';

export const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  const fragmentDefinitions = getFragmentDefinitionsByDocumentFiles(documentFiles);

  const files = documentFiles.map((file) => {
    if (!file.document) return file;
    const result = transformDocument({ documentNode: file.document, fragmentDefinitions });
    file.document = result.documentNode;
    return file;
  });

  return { documentFiles: files };
};

const transformDocument = (params: {
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
}): { documentNode: DocumentNode } => {
  const { fragmentDefinitions } = params;
  let documentNode = params.documentNode;

  let changedOriginalSpreadFragmentNames: string[] = [];
  documentNode.definitions.forEach((definition, index) => {
    if (definition.kind !== Kind.OPERATION_DEFINITION) return;
    const transformResult = transformFragmentSpreadFields({
      targetDefinition: definition,
      operationDefinition: definition,
      documentNode: documentNode,
      fragmentDefinitions,
    });
    const definitions: DefinitionNode[] = [...transformResult.documentNode.definitions];
    // Do not change the order of definitions because changing the order of definitions will replace wrong index
    definitions.splice(index, 1, transformResult.newDefinition);
    documentNode = { ...transformResult.documentNode, definitions };
    changedOriginalSpreadFragmentNames = [
      ...changedOriginalSpreadFragmentNames,
      ...transformResult.changedOriginalSpreadFragmentNames,
    ];
  });

  documentNode = removeUnnecessaryFragmentDefinitions({
    documentNode,
    changedOriginalSpreadFragmentNames,
  });

  return { documentNode };
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

const transformFragmentSpreadFields = <TDefinitionNode extends ASTNode>(params: {
  targetDefinition: TDefinitionNode;
  operationDefinition: OperationDefinitionNode;
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
}): {
  documentNode: DocumentNode;
  newDefinition: TDefinitionNode;
  changedOriginalSpreadFragmentNames: string[];
} => {
  const { targetDefinition, operationDefinition, fragmentDefinitions } = params;
  let documentNode = params.documentNode;
  let changedOriginalSpreadFragmentNames: string[] = [];
  const newDefinition = visit(targetDefinition, {
    FragmentSpread: {
      leave(originalNode) {
        const next = getFragmentDefinitionByName({ fragmentDefinitions, fragmentName: originalNode.name.value });
        if (!next) return;

        const argumentsDirective = getArgumentsDirective(originalNode);
        const argumentNodes = argumentsDirective?.arguments || [];

        const result = transformFragmentDefinition({
          targetFragmentDefinition: next,
          documentNode,
          operationDefinition,
          fragmentDefinitions,
          passedArguments: argumentNodes.length > 0 ? getArgumentObject({ argumentNodes }) : undefined,
        });
        documentNode = result.documentNode;

        changedOriginalSpreadFragmentNames = [
          ...changedOriginalSpreadFragmentNames,
          ...result.changedOriginalSpreadFragmentNames,
          originalNode.name.value,
        ];

        if (!result.changedFragmentName) return;

        return { ...originalNode, name: { ...originalNode.name, value: result.changedFragmentName } };
      },
    },
  }) as TDefinitionNode;

  return {
    documentNode,
    newDefinition,
    changedOriginalSpreadFragmentNames,
  };
};

// Remove a fragment definition if there is no place where the original fragment definition is used.
const removeUnnecessaryFragmentDefinitions = ({
  documentNode,
  changedOriginalSpreadFragmentNames,
}: {
  documentNode: DocumentNode;
  changedOriginalSpreadFragmentNames: string[];
}): DocumentNode => {
  const shouldDeleteFragmentNames: string[] = uniq(changedOriginalSpreadFragmentNames);
  visit(documentNode, {
    FragmentSpread: {
      leave(node) {
        const index = shouldDeleteFragmentNames.findIndex((name) => name === node.name.value);
        if (index !== -1) {
          shouldDeleteFragmentNames.splice(index, 1);
        }
      },
    },
  });
  documentNode = {
    ...documentNode,
    definitions: [
      ...documentNode.definitions.filter(
        (definition) =>
          definition.kind !== Kind.FRAGMENT_DEFINITION || !shouldDeleteFragmentNames.includes(definition.name.value),
      ),
    ],
  };
  return documentNode;
};

const transformFragmentDefinition = (params: {
  targetFragmentDefinition: FragmentDefinitionNode;
  operationDefinition: OperationDefinitionNode;
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  passedArguments?: Record<string, ValueNode>;
}): {
  documentNode: DocumentNode;
  changedOriginalSpreadFragmentNames: string[];
  changedFragmentName?: string;
} => {
  const { targetFragmentDefinition, operationDefinition, passedArguments, fragmentDefinitions } = params;
  let documentNode = params.documentNode;

  let newFragmentDefinition = getRenamedFragmentDefinition({
    node: targetFragmentDefinition,
    argumentsObject: passedArguments,
  });
  const existsFragmentDefinitionInDocument = !!documentNode.definitions.find(
    (definition) =>
      definition.kind === Kind.FRAGMENT_DEFINITION && definition.name.value === newFragmentDefinition.name.value,
  );
  const isOriginalName = newFragmentDefinition.name.value === targetFragmentDefinition.name.value;
  if (!isOriginalName && existsFragmentDefinitionInDocument) {
    return { documentNode, changedOriginalSpreadFragmentNames: [] };
  }

  const valueNodeMap: Record<string, ValueNode> = {};
  if (passedArguments) {
    visit(newFragmentDefinition, {
      Directive: {
        enter(node) {
          if (node.name.value !== ARGUMENT_DEFINITIONS_DIRECTIVE_NAME) return;
          const argumentDataList = getArgumentDefinitionDataList(node);
          argumentDataList.forEach((data) => {
            // Put the passed arguments into valueMap to fit them where they are used in the fragment.
            const passedArgumentValue = passedArguments[data.name.value];
            if (!passedArgumentValue) return;
            valueNodeMap[data.name.value] = passedArgumentValue;
          });
        },
      },
    });
  }

  newFragmentDefinition = visit(newFragmentDefinition, {
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

  const transformResult = transformFragmentSpreadFields({
    targetDefinition: newFragmentDefinition,
    operationDefinition,
    documentNode,
    fragmentDefinitions,
  });
  newFragmentDefinition = transformResult.newDefinition;
  documentNode = transformResult.documentNode;

  if (existsFragmentDefinitionInDocument) {
    // // Replace the fragment definition
    documentNode = {
      ...documentNode,
      definitions: [
        ...documentNode.definitions.filter(
          (definition) =>
            definition.kind !== Kind.FRAGMENT_DEFINITION || definition.name.value !== newFragmentDefinition.name.value,
        ),
        newFragmentDefinition,
      ],
    };
  } else {
    // Add the fragment definition
    documentNode = {
      ...documentNode,
      definitions: [...documentNode.definitions, newFragmentDefinition],
    };
  }

  return {
    documentNode,
    changedOriginalSpreadFragmentNames: transformResult.changedOriginalSpreadFragmentNames,
    changedFragmentName: newFragmentDefinition.name.value,
  };
};

const getRenamedFragmentDefinition = ({
  node,
  argumentsObject,
}: {
  node: FragmentDefinitionNode;
  argumentsObject?: Record<string, ValueNode>;
}): FragmentDefinitionNode => {
  if (!argumentsObject) return node;
  const str = Object.entries(argumentsObject)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([argName, valueNode]) => `${argName}:${print(valueNode)}`)
    .join(',')
    .replace(/\s+/g, '');
  const name = {
    ...node.name,
    value: getUniqueFragmentName(node.name.value, `${FRAGMENT_NAME_INFO_ID_1},${str}`),
  };
  return { ...node, name };
};
