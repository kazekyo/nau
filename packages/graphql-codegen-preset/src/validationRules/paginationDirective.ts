import { DirectiveName } from '@kazekyo/nau';
import {
  DirectiveNode,
  FieldNode,
  getNullableType,
  GraphQLError,
  GraphQLObjectType,
  GraphQLOutputType,
  ValidationRule,
} from 'graphql';

const PAGINATION_DIRECTIVE_NAME: DirectiveName = 'pagination';

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
  const nullableType = getNullableType(type);

  if (!(nullableType instanceof GraphQLObjectType)) {
    return false;
  }

  return nullableType.name.endsWith('Connection');
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
