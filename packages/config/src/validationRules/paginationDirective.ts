/* eslint-disable @typescript-eslint/no-unsafe-return */
import { DirectiveNode, FieldNode, GraphQLOutputType, ValidationRule } from 'graphql';
import { GraphQLError, isNonNullType, isObjectType } from '../dependencies/graphql';

const PAGINATION_DIRECTIVE_NAME = 'pagination';

function hasAfterArgument(fieldNode: FieldNode): boolean {
  return !!(fieldNode.arguments && fieldNode.arguments.find((arg) => arg.name.value === 'after'));
}

function hasBeforeArgument(fieldNode: FieldNode): boolean {
  return !!(fieldNode.arguments && fieldNode.arguments.find((arg) => arg.name.value === 'before'));
}

const getPaginationDirective = (fieldNode: FieldNode): DirectiveNode | undefined => {
  if (!fieldNode.directives) return undefined;
  return fieldNode.directives.find((directive) => directive.name.value === PAGINATION_DIRECTIVE_NAME);
};

function isPaginationType(type: GraphQLOutputType): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const connectionType = isNonNullType(type) ? type.ofType : type;

  if (!isObjectType(connectionType)) {
    return false;
  }

  return connectionType.name.endsWith('Connection');
}

export const paginationDirectiveValidationRule: ValidationRule = (context) => {
  return {
    Field: {
      enter(fieldNode) {
        const paginationDirective = getPaginationDirective(fieldNode);
        if (!paginationDirective) return;

        const type = context.getType();
        if (!type || !isPaginationType(type)) {
          context.reportError(
            new GraphQLError(
              `@${PAGINATION_DIRECTIVE_NAME} can only be used with types whose name ends with "Connection".`,
              fieldNode,
            ),
          );
          return;
        }

        if (!hasAfterArgument(fieldNode) && !hasBeforeArgument(fieldNode)) {
          context.reportError(
            new GraphQLError(
              `@${PAGINATION_DIRECTIVE_NAME} directive is required \`after\` or \`before\` argument.`,
              fieldNode,
            ),
          );
        }
      },
    },
  };
};
