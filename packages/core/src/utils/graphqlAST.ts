import { getMainDefinition } from '@apollo/client/utilities';
import { DocumentNode } from 'graphql/language';

export const isQueryOperation = (node: DocumentNode): boolean => {
  const mainDefinition = getMainDefinition(node);
  return mainDefinition.kind === 'OperationDefinition' && mainDefinition.operation === 'query';
};

export const isSubscriptionOperation = (query: DocumentNode): boolean => {
  const mainDefinition = getMainDefinition(query);
  return mainDefinition.kind === 'OperationDefinition' && mainDefinition.operation === 'subscription';
};
