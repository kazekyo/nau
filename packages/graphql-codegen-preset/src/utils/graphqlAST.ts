import { Types } from '@graphql-codegen/plugin-helpers';
import { DirectiveName } from '@nau/core';
import {
  DirectiveNode,
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
  SelectionSetNode,
} from 'graphql';
import { nonNullable } from './nonNullable';

export const pageInfoField: FieldNode = {
  kind: Kind.FIELD,
  name: { kind: Kind.NAME, value: 'pageInfo' },
  selectionSet: {
    kind: Kind.SELECTION_SET,
    selections: [
      { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'hasNextPage' } },
      { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'endCursor' } },
      { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'hasPreviousPage' } },
      { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'startCursor' } },
    ],
  },
};

export const cursorField: FieldNode = { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'cursor' } };

export const idField: FieldNode = { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'id' } };

export const typenameField: FieldNode = { kind: Kind.FIELD, name: { kind: Kind.NAME, value: '__typename' } };

export const nodeField: FieldNode = {
  kind: Kind.FIELD,
  name: { kind: Kind.NAME, value: 'node' },
  selectionSet: {
    kind: Kind.SELECTION_SET,
    selections: [idField, typenameField],
  },
};

export const edgesField: FieldNode = {
  kind: Kind.FIELD,
  name: { kind: Kind.NAME, value: 'edges' },
  selectionSet: {
    kind: Kind.SELECTION_SET,
    selections: [nodeField, cursorField],
  },
};

export const connectionIdField: FieldNode = {
  kind: Kind.FIELD,
  name: { kind: Kind.NAME, value: '_connectionId' },
  directives: [{ kind: Kind.DIRECTIVE, name: { kind: Kind.NAME, value: 'client' } }],
};

export function getOperationDefinitions(doc: DocumentNode): OperationDefinitionNode[] {
  return doc.definitions.filter((definition) => definition.kind === 'OperationDefinition') as OperationDefinitionNode[];
}

export const getFragmentDefinitions = (documentNode: DocumentNode): FragmentDefinitionNode[] => {
  return documentNode.definitions.filter(
    (definition): definition is FragmentDefinitionNode => definition.kind === 'FragmentDefinition',
  );
};

export const getFragmentDefinitionsByDocumentFiles = (
  documentFiles: Types.DocumentFile[],
): FragmentDefinitionNode[] => {
  return documentFiles
    .map((file) => file.document?.definitions)
    .filter(nonNullable)
    .flat()
    .filter((definition): definition is FragmentDefinitionNode => definition.kind === Kind.FRAGMENT_DEFINITION);
};

export const getFragmentDefinitionByName = ({
  fragmentDefinitions,
  fragmentName,
}: {
  fragmentDefinitions: FragmentDefinitionNode[];
  fragmentName: string;
}): FragmentDefinitionNode | undefined => {
  return fragmentDefinitions.find((definition) => definition.name.value === fragmentName);
};

export const getDirectives = ({
  node,
  directiveNames,
}: {
  node: FieldNode | SelectionNode | null;
  directiveNames: DirectiveName[];
}): DirectiveNode[] => {
  const directives = node?.directives?.filter((directive) =>
    directiveNames.find((name) => name === directive.name.value),
  );
  if (!directives) return [];
  return directives;
};

export const isSameNameFieldNode = ({ selection, name }: { selection: SelectionNode; name: string }): boolean => {
  return selection.kind === Kind.FIELD && selection.name.value === name;
};

// Add the field, but do nothing if the field already exists
export const addFieldWithoutDuplication = ({
  fieldNode,
  additionalFields,
}: {
  fieldNode: FieldNode;
  additionalFields: FieldNode[];
}): FieldNode => {
  if (!fieldNode.selectionSet) return fieldNode;
  const selectionSet = addFieldToSelectionSetNodeWithoutDuplication({
    selectionSetNode: fieldNode.selectionSet,
    additionalFields,
  });

  return {
    ...fieldNode,
    selectionSet,
  };
};

// Add the field, but do nothing if the field already exists
export const addFieldToSelectionSetNodeWithoutDuplication = ({
  selectionSetNode,
  additionalFields,
}: {
  selectionSetNode: SelectionSetNode;
  additionalFields: FieldNode[];
}): SelectionSetNode => {
  const selections = selectionSetNode.selections;

  const fieldNodes = additionalFields.filter(
    (fieldNode) => !selections.find((selection) => isSameNameFieldNode({ selection, name: fieldNode.name.value })),
  );
  if (fieldNodes.length === 0) return selectionSetNode;

  return {
    ...selectionSetNode,
    selections: [...selections, ...fieldNodes],
  };
};
