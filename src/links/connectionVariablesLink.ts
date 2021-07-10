import { ApolloLink, Operation } from '@apollo/client';
import { getOperationDefinition } from '@apollo/client/utilities';
import { OperationDefinitionNode, VariableDefinitionNode, print } from 'graphql/language';
import uniqWith from 'lodash.uniqwith';
import { nonNullable } from '../utils';
import { ContextType, createApolloLink } from './utils';

const transform = (operation: Operation): Operation => {
  const documentNode = operation.query;
  const context = operation.getContext() as ContextType;

  const operationDefinition = getOperationDefinition(documentNode);
  const argumentsData = context.nau?.connection?.argumentsData;
  const connectionVariables = context.nau?.connection?.variables;
  if (!operationDefinition || !argumentsData || !connectionVariables) return operation;

  const existingVariableDefinitions = operationDefinition.variableDefinitions || [];
  const connectionVariableDefinitions = Object.entries(argumentsData)
    .map(([_key, argumentData]): VariableDefinitionNode | null => {
      if (!argumentData) return null;
      const { node } = argumentData;
      const newNode: VariableDefinitionNode = {
        ...node,
        variable: { ...node.variable, name: { kind: 'Name', value: argumentData.name } },
      };
      return newNode;
    })
    .filter(nonNullable);
  const newOperationDefinition: OperationDefinitionNode = {
    ...operationDefinition,
    variableDefinitions: uniqWith(
      [...existingVariableDefinitions, ...connectionVariableDefinitions],
      (a, b) => a.variable.name.value === b.variable.name.value,
    ),
  };

  operation.query = {
    ...operation.query,
    definitions: [
      newOperationDefinition,
      ...documentNode.definitions.filter((definition) => definition.kind !== 'OperationDefinition'),
    ],
  };

  const newVariableArray = Object.entries(argumentsData)
    .map(([key, argumentData]): [string, number | string] | null => {
      if (!argumentData) return null;
      if (['first', 'last'].includes(key)) {
        return [argumentData.name, connectionVariables.count];
      } else {
        return [argumentData.name, connectionVariables.cursor];
      }
    })
    .filter(nonNullable);
  operation.variables = { ...operation.variables, ...Object.fromEntries(newVariableArray) };

  return operation;
};

export const createConnectionVariablesLink = (): ApolloLink => {
  return createApolloLink((operation) => transform(operation));
};
