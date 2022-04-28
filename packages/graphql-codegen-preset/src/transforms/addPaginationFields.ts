import { Types } from '@graphql-codegen/plugin-helpers';
import { PAGINATION_DIRECTIVE_NAME } from '@nau/core';
import { DocumentNode, FieldNode, Kind, visit } from 'graphql';
import {
  addFieldToSelectionSetNodeWithoutDuplication,
  addFieldWithoutDuplication,
  connectionIdField,
  cursorField,
  idField,
  isSameNameFieldNode,
  nodeField,
  pageInfoField,
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
      SelectionSet: {
        leave(selectionSetNode) {
          let existsConnectionField = false;
          const selections = selectionSetNode.selections.map((selection) => {
            if (selection.kind !== Kind.FIELD || !selection.directives) return selection;
            const paginationDirective = selection.directives.find(
              (directive) => directive.name.value === PAGINATION_DIRECTIVE_NAME,
            );
            if (!paginationDirective) return selection;

            existsConnectionField = true;

            let newFieldNode = addPageInfoField({ connectionFieldNode: selection });
            newFieldNode = addEdgesRelatedFields({ connectionFieldNode: newFieldNode });
            newFieldNode = addConnectionIdField({ connectionFieldNode: newFieldNode });

            return newFieldNode;
          });

          if (!existsConnectionField) return;

          const newSelectionSetNode = addFieldToSelectionSetNodeWithoutDuplication({
            selectionSetNode: { ...selectionSetNode, selections },
            additionalFields: [idField, typenameField],
          });

          return newSelectionSetNode;
        },
      },
    }) as DocumentNode;
    return file;
  });

  return { documentFiles: files };
};

const addPageInfoField = ({ connectionFieldNode }: { connectionFieldNode: FieldNode }): FieldNode => {
  if (!connectionFieldNode.selectionSet) return connectionFieldNode;
  return addFieldWithoutDuplication({ fieldNode: connectionFieldNode, additionalFields: [pageInfoField] });
};

const addConnectionIdField = ({ connectionFieldNode }: { connectionFieldNode: FieldNode }): FieldNode => {
  return addFieldWithoutDuplication({ fieldNode: connectionFieldNode, additionalFields: [connectionIdField] });
};

const addNodeRelatedFields = ({ edgesFieldNode }: { edgesFieldNode: FieldNode }): FieldNode => {
  if (!edgesFieldNode.selectionSet) return edgesFieldNode;

  const selections = edgesFieldNode.selectionSet.selections;
  const nodeIndex = selections.findIndex((selection) => isSameNameFieldNode({ selection, name: 'node' }));
  if (nodeIndex === -1) {
    // When this function is called, curser exists, so node field must be included for consistency.
    return {
      ...edgesFieldNode,
      selectionSet: {
        ...edgesFieldNode.selectionSet,
        selections: [...selections, nodeField],
      },
    };
  }

  const nodeFieldNode = addFieldWithoutDuplication({
    fieldNode: selections[nodeIndex] as FieldNode,
    additionalFields: [idField, typenameField],
  });

  const newSelections = [...selections];
  newSelections[nodeIndex] = nodeFieldNode;

  return {
    ...edgesFieldNode,
    selectionSet: {
      ...edgesFieldNode.selectionSet,
      selections: newSelections,
    },
  };
};

const addEdgesRelatedFields = ({ connectionFieldNode }: { connectionFieldNode: FieldNode }): FieldNode => {
  if (!connectionFieldNode.selectionSet) return connectionFieldNode;

  const selections = connectionFieldNode.selectionSet.selections;

  const edgesIndex = selections.findIndex((selection) => isSameNameFieldNode({ selection, name: 'edges' }));

  // If there is no edges field, do nothing. Because it does not contain any nodes to paginate.
  if (edgesIndex === -1) return connectionFieldNode;

  let edgesFieldNode = selections[edgesIndex] as FieldNode;

  edgesFieldNode = addFieldWithoutDuplication({ fieldNode: edgesFieldNode, additionalFields: [cursorField] });
  edgesFieldNode = addNodeRelatedFields({ edgesFieldNode });

  const newSelections = [...selections];
  newSelections[edgesIndex] = edgesFieldNode;

  return {
    ...connectionFieldNode,
    selectionSet: {
      ...connectionFieldNode.selectionSet,
      selections: newSelections,
    },
  };
};
