import { ApolloLink, Operation } from '@apollo/client';
import {
  ArgumentNode,
  DocumentNode,
  FieldNode,
  TypeNode,
  VariableDefinitionNode,
  VariableNode,
  visit,
} from 'graphql/language';
import { ConnectionArgumentDataType, ContextType, createApolloLink } from './utils';

const CONNECTION_DIRECTIVE_NAME = 'nauConnection';

const getConnectionArguments = ({
  fieldNode,
}: {
  fieldNode: FieldNode;
}): { first?: ArgumentNode; after?: ArgumentNode; last?: ArgumentNode; before?: ArgumentNode } | undefined => {
  if (!fieldNode.arguments) return undefined;
  const argumentNodes = fieldNode.arguments;
  const findArgument = (name: 'first' | 'last' | 'after' | 'before') =>
    argumentNodes.find((argumentNode) => name === argumentNode.name.value);
  return {
    first: findArgument('first'),
    after: findArgument('after'),
    last: findArgument('last'),
    before: findArgument('before'),
  };
};

const transform = (operation: Operation): Operation => {
  const context = operation.getContext() as ContextType;
  let documentNode = operation.query;
  documentNode = visit(documentNode, {
    Directive: {
      enter(node, _key, _parent, _path, ancestors) {
        const directiveName = node.name.value;
        if (directiveName !== CONNECTION_DIRECTIVE_NAME) return;

        const fieldNode = ancestors[ancestors.length - 1];

        if (!fieldNode || !('kind' in fieldNode) || fieldNode.kind !== 'Field') {
          throw Error(`@${CONNECTION_DIRECTIVE_NAME} can only be added to field.`);
        }

        if (!context.nau?.refetch) return null;

        const connectionArgumentNodes = getConnectionArguments({ fieldNode });
        if (!connectionArgumentNodes) {
          return null;
        }

        const connectionVariables = Object.entries(connectionArgumentNodes).map(([key, argumentNode]): [
          string,
          undefined | ConnectionArgumentDataType,
        ] => {
          if (!argumentNode || argumentNode.value.kind !== 'Variable') return [key, undefined];
          // Create variableDefinition with the name of the variable used in the argument.
          const variable: VariableNode = {
            kind: 'Variable',
            name: { kind: 'Name', value: argumentNode.value.name.value },
          };
          const typeNode: TypeNode = {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: ['first', 'last'].includes(key) ? 'Int' : 'String' },
            },
          };
          const variableDefinition: VariableDefinitionNode = {
            kind: 'VariableDefinition',
            type: typeNode,
            variable: variable,
            defaultValue: undefined,
            directives: [],
          };
          const variableData: ConnectionArgumentDataType = {
            node: variableDefinition,
            name: argumentNode.value.name.value,
          };
          return [key, variableData];
        });

        const newContext: ContextType = {
          nau: {
            ...context.nau,
            connection: { ...context.nau.connection, argumentsData: Object.fromEntries(connectionVariables) },
          },
        };

        operation.setContext(newContext);
        return null;
      },
    },
  }) as DocumentNode;

  operation.query = documentNode;
  return operation;
};

export const createConnectionLink = (): ApolloLink => {
  return createApolloLink((operation) => transform(operation));
};
