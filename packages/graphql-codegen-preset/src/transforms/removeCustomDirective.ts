import { Types } from '@graphql-codegen/plugin-helpers';
import {
  ARGUMENTS_DIRECTIVE_NAME,
  ARGUMENT_DEFINITIONS_DIRECTIVE_NAME,
  PAGINATION_DIRECTIVE_NAME,
  REFETCHABLE_DIRECTIVE_NAME,
} from '@nau/core';
import { visit } from 'graphql';

const DIRECTIVES = [
  ARGUMENT_DEFINITIONS_DIRECTIVE_NAME,
  ARGUMENTS_DIRECTIVE_NAME,
  REFETCHABLE_DIRECTIVE_NAME,
  PAGINATION_DIRECTIVE_NAME,
];

export const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  const files = documentFiles.map((file) => {
    if (!file.document) return file;

    file.document = visit(file.document, {
      Directive: {
        enter(node) {
          if (DIRECTIVES.includes(node.name.value)) {
            return null;
          }
        },
      },
    });
    return file;
  });

  return { documentFiles: files };
};
