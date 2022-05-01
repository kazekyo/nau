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

export const cursorField: FieldNode = { kind: 'Field', name: { kind: 'Name', value: 'cursor' } };

export const idField: FieldNode = { kind: 'Field', name: { kind: 'Name', value: 'id' } };

export const typenameField: FieldNode = { kind: 'Field', name: { kind: 'Name', value: '__typename' } };

export const nodeField: FieldNode = {
  kind: 'Field',
  name: { kind: 'Name', value: 'node' },
  selectionSet: {
    kind: 'SelectionSet',
    selections: [idField, typenameField],
  },
};

export const edgesField: FieldNode = {
  kind: 'Field',
  name: { kind: 'Name', value: 'edges' },
  selectionSet: {
    kind: 'SelectionSet',
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
  return selection.kind === 'Field' && selection.name.value === name;
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
