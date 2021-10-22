import { ApolloLink, Operation } from '@apollo/client';
import { DocumentNode, visit } from 'graphql/language';
import { isFragmentDefinition } from '../utils';
import { createApolloLink } from './utils';

const DIRECTIVE_NAME = 'refetchable';

type ContextType = { nau?: { refetch?: { fragmentName: string } } };

const transform = (operation: Operation): Operation => {
  const documentNode = operation.query;
  const context = operation.getContext() as ContextType;
  const fragmentName = context.nau?.refetch?.fragmentName;

  let queryName: string | undefined;
  const newDocumentNode = visit(documentNode, {
    Directive: {
      enter(node, _key, _parent, _path, ancestors) {
        if (node.name.value !== DIRECTIVE_NAME) return;

        const parentFragmentDefinition = ancestors[ancestors.length - 1];
        if (!isFragmentDefinition(parentFragmentDefinition)) {
          throw Error(`@${DIRECTIVE_NAME} can only be added to fragment.`);
        }

        const queryNameArgument =
          node.arguments && node.arguments.find((argument) => argument.name.value === 'queryName');
        if (!queryNameArgument || queryNameArgument.value.kind !== 'StringValue') {
          throw Error("Expected the 'queryName' argument of @refetchable to be provided.");
        }

        if (fragmentName === parentFragmentDefinition.name.value) {
          queryName = queryNameArgument.value.value;
        }
        return null;
      },
    },
  }) as DocumentNode;

  if (!context.nau?.refetch) {
    operation.query = newDocumentNode;
    return operation;
  }

  if (context.nau.refetch && !queryName) {
    throw Error('Expected @refetchable to be present in the fragment of usePaginationFragment.');
  }

  operation.query = visit(newDocumentNode, {
    OperationDefinition: {
      enter(node) {
        return { ...node, name: { ...node.name, value: queryName } };
      },
    },
  }) as DocumentNode;
  operation.operationName = queryName || operation.operationName;

  return operation;
};

export const createRefetchableLink = (): ApolloLink => {
  return createApolloLink((operation) => transform(operation));
};
