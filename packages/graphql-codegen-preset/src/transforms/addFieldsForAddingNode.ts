import { Types } from '@graphql-codegen/plugin-helpers';
import { INSERT_NODE_DIRECTIVE_NAMES } from '@nau/core';
import { visit } from 'graphql';
import {
  addFieldToSelectionSetNodeWithoutDuplication,
  getDirectives,
  idField,
  typenameField,
} from '../utils/graphqlAST';

export const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  const files = documentFiles.map((file) => {
    if (!file.document) return file;

    file.document = visit(file.document, {
      Field: {
        leave(fieldNode) {
          if (!fieldNode.directives || !fieldNode.selectionSet) return fieldNode;
          const directives = getDirectives({ node: fieldNode, directiveNames: INSERT_NODE_DIRECTIVE_NAMES });
          if (directives.length === 0) return fieldNode;

          const selectionSet = addFieldToSelectionSetNodeWithoutDuplication({
            selectionSetNode: fieldNode.selectionSet,
            additionalFields: [idField, typenameField],
          });

          return { ...fieldNode, selectionSet };
        },
      },
    });
    return file;
  });

  return { documentFiles: files };
};
