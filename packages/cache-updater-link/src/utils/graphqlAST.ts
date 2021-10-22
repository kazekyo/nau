import { getMainDefinition } from '@apollo/client/utilities';
import { DocumentNode, FragmentDefinitionNode } from 'graphql/language';

export const isQueryOperation = (node: DocumentNode): boolean => {
  const mainDefinition = getMainDefinition(node);
  return mainDefinition.kind === 'OperationDefinition' && mainDefinition.operation === 'query';
};

export const isSubscriptionOperation = (query: DocumentNode): boolean => {
  const mainDefinition = getMainDefinition(query);
  return mainDefinition.kind === 'OperationDefinition' && mainDefinition.operation === 'subscription';
};

export const isFragmentDefinition = (node: unknown): node is FragmentDefinitionNode => {
  if (!node) return false;
  const notNullNode = node as { kind?: string | FragmentDefinitionNode['kind'] };
  return 'kind' in notNullNode && notNullNode.kind === 'FragmentDefinition';
};

export const getFragmentDefinitions = (documentNode: DocumentNode): FragmentDefinitionNode[] => {
  return documentNode.definitions.filter(
    (definition): definition is FragmentDefinitionNode => definition.kind === 'FragmentDefinition',
  );
};
