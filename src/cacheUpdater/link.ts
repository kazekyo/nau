import { ApolloLink, FetchResult, Observable } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { DocumentNode, visit } from 'graphql/language';
import { CUSTOM_DIRECTIVE_NAMES } from './directiveName';

export const isQueryOperation = (query: DocumentNode): boolean => {
  const mainDefinition = getMainDefinition(query);
  return mainDefinition.kind === 'OperationDefinition' && mainDefinition.operation === 'query';
};

export const isSubscriptionOperation = (query: DocumentNode): boolean => {
  const mainDefinition = getMainDefinition(query);
  return mainDefinition.kind === 'OperationDefinition' && mainDefinition.operation === 'subscription';
};

const transform = (input: DocumentNode): DocumentNode => {
  if (isQueryOperation(input)) {
    return input;
  }

  let argumentNames: string[] = [];
  visit(input, {
    Directive: {
      enter(node) {
        if (node.arguments !== undefined && node.arguments?.length > 0) {
          argumentNames = node.arguments.map((m) => m.name.value);
        }
      },
    },
  });

  return visit(input, {
    VariableDefinition: {
      enter(node) {
        if (argumentNames.includes(node.variable.name.value)) {
          return null;
        }
      },
    },
    Directive: {
      enter(node) {
        if (CUSTOM_DIRECTIVE_NAMES.find((name) => name === node.name.value)) {
          return null;
        }
      },
    },
  }) as DocumentNode;
};

export const createCacheUpdaterLink = (): ApolloLink => {
  return new ApolloLink((operation, forward) => {
    operation.query = transform(operation.query);
    if (isSubscriptionOperation(operation.query)) {
      return new Observable<FetchResult>((observer) =>
        forward(operation).subscribe((response) => observer.next(response)),
      );
    }

    if (!forward) return null;

    return forward(operation).map(({ data, ...response }) => {
      return { ...response, data };
    });
  });
};
