import { ApolloLink, Operation } from '@apollo/client';
import { DocumentNode, visit } from 'graphql/language';
import { uniq } from 'lodash';
import { CACHE_UPDATER_DIRECTIVE_NAMES, DELETE_VARIABLES_DIRECTIVE_NAMES } from '../policies';
import { isQueryOperation } from '../utils/graphqlAST';
import { createApolloLink } from './utils';

const transform = (operation: Operation): Operation => {
  const input = operation.query;
  if (isQueryOperation(input)) return operation;

  let argumentNames: string[] = [];
  visit(input, {
    Directive: {
      enter(node) {
        if (
          DELETE_VARIABLES_DIRECTIVE_NAMES.find((name) => name === node.name.value) &&
          node.arguments &&
          node.arguments.length > 0
        ) {
          argumentNames = [...argumentNames, ...node.arguments.map((m) => m.name.value)];
        }
      },
    },
  });

  argumentNames = uniq(argumentNames);

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

  operation.variables = Object.fromEntries(
    Object.entries(operation.variables).filter(([key]) => !argumentNames.includes(key)),
  );

  return operation;
};

export const createCacheUpdaterLink = (): ApolloLink => {
  return createApolloLink((operation) => transform(operation));
};
