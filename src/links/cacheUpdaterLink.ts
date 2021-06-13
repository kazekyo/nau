import { ApolloLink, Operation } from '@apollo/client';
import { DocumentNode, visit } from 'graphql/language';
import { CACHE_UPDATER_DIRECTIVE_NAMES } from '../cacheUpdater/directiveName';
import { isQueryOperation } from '../utils';
import { createApolloLink } from './utils';

const transform = (operation: Operation): Operation => {
  const input = operation.query;
  if (isQueryOperation(input)) return operation;

  let argumentNames: string[] = [];
  visit(input, {
    Directive: {
      enter(node) {
        if (
          CACHE_UPDATER_DIRECTIVE_NAMES.find((name) => name === node.name.value) &&
          node.arguments &&
          node.arguments.length > 0
        ) {
          argumentNames = node.arguments.map((m) => m.name.value);
        }
      },
    },
  });

  operation.query = visit(input, {
    VariableDefinition: {
      enter(node) {
        if (argumentNames.includes(node.variable.name.value)) {
          return null;
        }
      },
    },
    Directive: {
      enter(node) {
        if (CACHE_UPDATER_DIRECTIVE_NAMES.find((name) => name === node.name.value)) {
          return null;
        }
      },
    },
  }) as DocumentNode;

  return operation;
};

export const createCacheUpdaterLink = (): ApolloLink => {
  return createApolloLink((operation) => transform(operation));
};
