import { ApolloLink, Operation } from '@apollo/client';
import { getOperationDefinition } from '@apollo/client/utilities';
import {
  ArgumentNode,
  ASTNode,
  DirectiveNode,
  DocumentNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  OperationDefinitionNode,
  ValueNode,
  VariableNode,
  visit,
} from 'graphql/language';
import uniqWith from 'lodash.uniqwith';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import { getFragmentDefinitions } from '../utils';
import { ConnectionArgumentDataType, ContextType, createApolloLink } from './utils';

const nanoid = customAlphabet(alphanumeric, 10);

const ARGUMENT_DEFINITIONS_DIRECTIVE_NAME = 'argumentDefinitions';
const ARGUMENTS_DIRECTIVE_NAME = 'arguments';
const DIRECTIVE_NAMES = [ARGUMENT_DEFINITIONS_DIRECTIVE_NAME, ARGUMENTS_DIRECTIVE_NAME];

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

const getVariableNodeFromOperationDefinition = ({
  operationDefinition,
  variableName,
}: {
  operationDefinition: OperationDefinitionNode;
  variableName: string;
}): VariableNode | undefined => {
  if (!operationDefinition.variableDefinitions || operationDefinition.variableDefinitions.length === 0) {
    return undefined;
  }
  const variableDefinition = operationDefinition.variableDefinitions.find(
    (definition) => definition.variable.name.value === variableName,
  );
  if (!variableDefinition) return undefined;
  return variableDefinition.variable;
};

const transformFragmentDefinition = (params: {
  fragmentDefinition: FragmentDefinitionNode;
  operationDefinition: OperationDefinitionNode;
  documentNode: DocumentNode;
  context: ContextType;
  newFragmentDefinitions: FragmentDefinitionNode[];
  passedArguments?: Record<string, ValueNode>;
  replacedFragmentName?: string;
}): { newFragmentDefinitions: FragmentDefinitionNode[]; newContext: ContextType } => {
  const { documentNode, operationDefinition, passedArguments } = params;
  let currentFragmentDefinition = params.fragmentDefinition;
  let newFragmentDefinitions = params.newFragmentDefinitions;
  let newContext = params.context;

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
      enter(node, _key, parent, _path, ancestors) {
        if (!node.arguments || node.arguments.length === 0) return;

        if (node.name.value !== ARGUMENT_DEFINITIONS_DIRECTIVE_NAME) return;

        const parentFragmentNode = ancestors[ancestors.length - 1];
        if (
          !parentFragmentNode ||
          !('kind' in parentFragmentNode) ||
          parentFragmentNode.kind !== 'FragmentDefinition'
        ) {
          throw Error(`@${ARGUMENT_DEFINITIONS_DIRECTIVE_NAME} can only be added to fragment.`);
        }

        node.arguments.forEach((argument) => {
          if (argument.value.kind !== 'ObjectValue') {
            throw Error(`${ARGUMENT_DEFINITIONS_DIRECTIVE_NAME} needs a argument called \`type\`.`);
          }
          const typeField = argument.value.fields.find((field) => field.name.value === 'type');
          if (!typeField || typeField.value.kind != 'StringValue') {
            throw Error(`@${ARGUMENT_DEFINITIONS_DIRECTIVE_NAME} needs a argument called \`type\`.`);
          }

          const currentArgumentName = argument.name.value;
          // Put the passed arguments into valueMap to fit them where they are used in the fragment.
          if (passedArguments) {
            const passedArgumentValue = passedArguments[currentArgumentName];
            if (passedArgumentValue) {
              valueNodeMap[currentArgumentName] = passedArgumentValue;
              if (!newContext.nau?.connection?.argumentsData || passedArgumentValue.kind !== 'Variable') {
                return;
              }
              // In the case of `@arguments(child: $parent)`, if `connection(first: $child)` is used in this this fragment,
              //   it will be replaced by `connection(first: $parent)`.
              // So the variable definition in the query also needs to replace the name from `child` to `parent`.
              const connectionArgumentsDataArray = Object.entries(newContext.nau.connection.argumentsData).map(
                ([key, connectionArgumentData]): [string, ConnectionArgumentDataType | undefined] => {
                  if (connectionArgumentData?.name !== currentArgumentName) return [key, connectionArgumentData];

                  return [key, { ...connectionArgumentData, name: passedArgumentValue.name.value }];
                },
              );
              newContext.nau.connection.argumentsData = Object.fromEntries(connectionArgumentsDataArray);
              return;
            }
          }

          // If there is the variable with the same name in the variable to be added in connectionVariablesLink,
          //   don't use the default value or null, do nothing.
          if (newContext.nau?.connection?.argumentsData) {
            const isSameName = Object.entries(newContext.nau.connection.argumentsData).find(
              ([_, argumentData]) => argumentData?.name === currentArgumentName,
            );
            if (isSameName) return;
          }

          // If they are in variableDefinition, don't use the default value or null, do nothing.
          const existingVariable = getVariableNodeFromOperationDefinition({
            operationDefinition,
            variableName: currentArgumentName,
          });
          if (existingVariable) return;

          const defaultValueField = argument.value.fields.find((field) => field.name.value === 'defaultValue');
          if (defaultValueField) {
            valueNodeMap[currentArgumentName] = defaultValueField.value;
            return;
          }

          if (!typeField.value.value.endsWith('!')) {
            valueNodeMap[currentArgumentName] = { kind: 'NullValue' };
          }
        });
      },
    },
  }) as FragmentDefinitionNode;

  currentFragmentDefinition = visit(currentFragmentDefinition, {
    Argument(node) {
      // Look for the use of variables in the argument, and replace them if necessary
      if (node.value.kind === 'Variable') {
        const variableName = node.value.name.value;
        const valueNode = valueNodeMap[variableName];
        if (valueNode) {
          if (valueNode.kind === 'NullValue') {
            return null;
          } else {
            return { ...node, value: valueNode };
          }
        }
      }
    },
  }) as FragmentDefinitionNode;

  const transformResult = transformFragmentSpread({
    targetDefinition: currentFragmentDefinition,
    operationDefinition,
    documentNode,
    context: newContext,
    newFragmentDefinitions,
  });
  newContext = transformResult.newContext;
  newFragmentDefinitions = transformResult.newFragmentDefinitions;
  currentFragmentDefinition = transformResult.newDefinition;

  newFragmentDefinitions.push(currentFragmentDefinition);

  return { newFragmentDefinitions, newContext };
};

const transformFragmentSpread = <TDefinitionNode extends ASTNode>({
  targetDefinition,
  operationDefinition,
  documentNode,
  context,
  newFragmentDefinitions,
}: {
  targetDefinition: TDefinitionNode;
  operationDefinition: OperationDefinitionNode;
  documentNode: DocumentNode;
  context: ContextType;
  newFragmentDefinitions: FragmentDefinitionNode[];
}): {
  newFragmentDefinitions: FragmentDefinitionNode[];
  newContext: ContextType;
  newDefinition: TDefinitionNode;
} => {
  let newContext = context;
  const newDefinition = visit(targetDefinition, {
    FragmentSpread: {
      enter(node) {
        const next = getFragmentDefinition(documentNode, node.name.value);
        if (!next) return;

        const argumentsDirective = getArgumentsDirective(node);
        if (argumentsDirective) {
          if (!argumentsDirective.arguments) {
            throw Error(`There are no arguments in @${ARGUMENTS_DIRECTIVE_NAME}.`);
          }
          const replacedNameNode = getReplacedNameNode(node);
          const result = transformFragmentDefinition({
            fragmentDefinition: next,
            documentNode,
            operationDefinition,
            context: newContext,
            newFragmentDefinitions,
            passedArguments: getArgumentObject({ argumentNodes: argumentsDirective.arguments }),
            replacedFragmentName: replacedNameNode.name.value,
          });
          newFragmentDefinitions = newFragmentDefinitions.concat(result.newFragmentDefinitions);
          newContext = result.newContext;
          return replacedNameNode;
        } else {
          const result = transformFragmentDefinition({
            fragmentDefinition: next,
            documentNode: documentNode,
            operationDefinition,
            context: newContext,
            newFragmentDefinitions,
          });
          newFragmentDefinitions = newFragmentDefinitions.concat(result.newFragmentDefinitions);
          newContext = result.newContext;
        }
      },
    },
  }) as TDefinitionNode;
  return { newFragmentDefinitions, newContext, newDefinition };
};

const getFragmentDefinition = (
  documentNode: DocumentNode,
  fragmentName: string,
): FragmentDefinitionNode | undefined => {
  return getFragmentDefinitions(documentNode).find((definition) => definition.name.value === fragmentName);
};

const getReplacedNameNode = (node: FragmentSpreadNode): FragmentSpreadNode => {
  const name = { ...node.name, value: node.name.value + '_' + nanoid() };
  return { ...node, name };
};

const transform = ({ operation }: { operation: Operation }): Operation => {
  const documentNode = operation.query;

  const operationDefinition = getOperationDefinition(documentNode);
  if (!operationDefinition) return operation;

  let newContext = operation.getContext() as ContextType;

  let newFragmentDefinitions: FragmentDefinitionNode[] = [];

  let newOperationDefinition = operationDefinition;
  const transformResult = transformFragmentSpread({
    targetDefinition: operationDefinition,
    operationDefinition,
    documentNode,
    context: newContext,
    newFragmentDefinitions,
  });
  newContext = transformResult.newContext;
  newFragmentDefinitions = transformResult.newFragmentDefinitions;
  newOperationDefinition = transformResult.newDefinition;

  const definitions = [
    newOperationDefinition,
    ...documentNode.definitions.filter(
      (definition) => definition.kind !== 'FragmentDefinition' && definition.kind !== 'OperationDefinition',
    ),
    ...uniqWith(newFragmentDefinitions, (a, b) => a.name.value === b.name.value),
  ];

  // Remove @arguments and @argumentDefinitions
  const newDocumentNode = visit(
    { ...documentNode, definitions },
    {
      Directive: {
        enter(node) {
          if (DIRECTIVE_NAMES.find((name) => name === node.name.value)) {
            return null;
          }
        },
      },
    },
  ) as DocumentNode;

  operation.query = newDocumentNode;
  operation.setContext(newContext);
  return operation;
};

export const createArgumentDefinitionsLink = (): ApolloLink => {
  return createApolloLink((operation) => transform({ operation }));
};
