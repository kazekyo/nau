import { ApolloLink, FetchResult, Operation } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { isSubscriptionOperation } from '../utils';

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
