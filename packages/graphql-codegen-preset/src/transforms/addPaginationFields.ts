import { Types } from '@graphql-codegen/plugin-helpers';
import { DocumentNode, FieldNode, visit } from 'graphql';
import { SelectionNode } from 'graphql/language';
import { PAGINATION_DIRECTIVE_NAME } from '../utils/directive';

const pageInfoField: FieldNode = {
  kind: 'Field',
  name: { kind: 'Name', value: 'pageInfo' },
  selectionSet: {
    kind: 'SelectionSet',
    selections: [
      { kind: 'Field', name: { kind: 'Name', value: 'hasNextPage' } },
      { kind: 'Field', name: { kind: 'Name', value: 'endCursor' } },
      { kind: 'Field', name: { kind: 'Name', value: 'hasPreviousPage' } },
      { kind: 'Field', name: { kind: 'Name', value: 'startCursor' } },
    ],
  },
};

const cursorField: FieldNode = { kind: 'Field', name: { kind: 'Name', value: 'cursor' } };
const idField: FieldNode = { kind: 'Field', name: { kind: 'Name', value: 'id' } };
const typenameField: FieldNode = { kind: 'Field', name: { kind: 'Name', value: '__typename' } };
const nodeField: FieldNode = {
  kind: 'Field',
  name: { kind: 'Name', value: 'node' },
  selectionSet: {
    kind: 'SelectionSet',
    selections: [idField, typenameField],
  },
};

export const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  const files = documentFiles.map((file) => {
    if (!file.document) return file;

    file.document = visit(file.document, {
      Field: {
        enter(fieldNode) {
          if (!fieldNode.directives) return;
          const paginationDirective = fieldNode.directives.find(
            (directive) => directive.name.value === PAGINATION_DIRECTIVE_NAME,
          );
          if (!paginationDirective) return;

          let newFieldNode = addPageInfoField({ connectionFieldNode: fieldNode });
          newFieldNode = addEdgesRelatedFields({ connectionFieldNode: newFieldNode });

          return newFieldNode;
        },
      },
    }) as DocumentNode;
    return file;
  });

  return { documentFiles: files };
};

const isFieldNode = ({ selection, name }: { selection: SelectionNode; name: string }) => {
  return selection.kind === 'Field' && selection.name.value === name;
};

const addPageInfoField = ({ connectionFieldNode }: { connectionFieldNode: FieldNode }): FieldNode => {
  if (!connectionFieldNode.selectionSet) return connectionFieldNode;

  const selections = connectionFieldNode.selectionSet.selections;

  const pageInfoIndex = selections.findIndex((selection) => isFieldNode({ selection, name: 'pageInfo' }));
  if (pageInfoIndex > -1) return connectionFieldNode; // If the pageInfo field is already exists, do nothing

  return {
    ...connectionFieldNode,
    selectionSet: {
      ...connectionFieldNode.selectionSet,
      selections: [...selections, pageInfoField],
    },
  };
};

// Add the field, but do nothing if the field already exists
const addFieldWithoutDuplication = ({
  fieldNode,
  addingField,
}: {
  fieldNode: FieldNode;
  addingField: FieldNode;
}): FieldNode => {
  if (!fieldNode.selectionSet) return fieldNode;

  const selections = fieldNode.selectionSet.selections;
  const name = addingField.name.value;
  const index = selections.findIndex((selection) => isFieldNode({ selection, name }));
  if (index > -1) return fieldNode;

  return {
    ...fieldNode,
    selectionSet: {
      ...fieldNode.selectionSet,
      selections: [...selections, addingField],
    },
  };
};

const addNodeRelatedFields = ({ edgesFieldNode }: { edgesFieldNode: FieldNode }): FieldNode => {
  if (!edgesFieldNode.selectionSet) return edgesFieldNode;

  const selections = edgesFieldNode.selectionSet.selections;
  const nodeIndex = selections.findIndex((selection) => isFieldNode({ selection, name: 'node' }));
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

  let nodeFieldNode = selections[nodeIndex] as FieldNode;
  nodeFieldNode = addFieldWithoutDuplication({ fieldNode: nodeFieldNode, addingField: idField });
  nodeFieldNode = addFieldWithoutDuplication({ fieldNode: nodeFieldNode, addingField: typenameField });

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

  const edgesIndex = selections.findIndex((selection) => isFieldNode({ selection, name: 'edges' }));

  // If there is no edges field, do nothing. Because it does not contain any nodes to paginate.
  if (edgesIndex === -1) return connectionFieldNode;

  let edgesFieldNode = selections[edgesIndex] as FieldNode;

  edgesFieldNode = addFieldWithoutDuplication({ fieldNode: edgesFieldNode, addingField: cursorField });
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
