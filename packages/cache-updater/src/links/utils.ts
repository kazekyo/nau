import { ApolloLink, FetchResult, Operation } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { VariableDefinitionNode } from 'graphql/language';
import { isSubscriptionOperation } from '../utils';

export type ConnectionArgumentDataType = { node: VariableDefinitionNode; name: string };
export type ConnectionArgumentsDataType = {
  first?: ConnectionArgumentDataType;
  last?: ConnectionArgumentDataType;
  after?: ConnectionArgumentDataType;
  before?: ConnectionArgumentDataType;
};
export type ContextType = {
  nau?: {
    refetch?: { fragmentName: string };
    connection?: { variables?: { count: number; cursor: string }; argumentsData?: ConnectionArgumentsDataType };
  };
};

export const createApolloLink = (transform: (operation: Operation) => Operation): ApolloLink => {
  return new ApolloLink((operation, forward) => {
    if (!forward) return null;

    const newOperation = transform(operation);
    if (isSubscriptionOperation(newOperation.query)) {
      return new Observable<FetchResult>((observer) =>
        forward(newOperation).subscribe((response) => observer.next(response)),
      );
    }

    return forward(newOperation).map((response) => response);
  });
};
