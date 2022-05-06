import { Types } from '@graphql-codegen/plugin-helpers';
import {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  Kind,
  SelectionNode,
  SelectionSetNode,
  visit,
} from 'graphql';
import {
  addFieldToSelectionSetNodeWithoutDuplication,
  addFieldWithoutDuplication,
  connectionIdField,
  cursorField,
  getDirectives,
  getFragmentDefinitionByName,
  getFragmentDefinitionsByDocumentFiles,
  idField,
  nodeField,
  pageInfoField,
  typenameField,
} from '../utils/graphqlAST';
import { nonNullable } from '../utils/nonNullable';

type ConnectionRelatedFieldName = 'edges' | 'node' | 'cursor' | 'pageInfo' | 'id' | '__typename';

export const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  let fragmentDefinitions = getFragmentDefinitionsByDocumentFiles(documentFiles);
  let changedFragmentDefinitions: FragmentDefinitionNode[] = [];

  let files = documentFiles.map((file) => {
    if (!file.document) return file;
    const result = addFields({ documentNode: file.document, fragmentDefinitions });
    file.document = result.documentNode;
    fragmentDefinitions = result.fragmentDefinitions;
    changedFragmentDefinitions = mergeFragmentDefinitions(
      changedFragmentDefinitions,
      result.changedFragmentDefinitions,
    );
    return file;
  });

  files = files.map((file) => {
    if (!file.document) return file;
    file.document = visit(file.document, {
      FragmentDefinition: {
        leave(fragmentDefinitionNode) {
          const fragmentDefinition = changedFragmentDefinitions.find(
            (definition) => definition.name.value === fragmentDefinitionNode.name.value,
          );
          if (!fragmentDefinition) return;
          return fragmentDefinition;
        },
      },
    });
    return file;
  });

  return { documentFiles: files };
};

const addFields = ({
  documentNode,
  fragmentDefinitions,
}: {
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
}): {
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  changedFragmentDefinitions: FragmentDefinitionNode[];
} => {
  let newFragmentDefinitions = fragmentDefinitions;
  let changedFragmentDefinitions: FragmentDefinitionNode[] = [];

  const document = visit(documentNode, {
    SelectionSet: {
      leave(selectionSetNode) {
        let existsConnectionField = false;
        const selections = selectionSetNode.selections.map((selection) => {
          if (selection.kind !== Kind.FIELD || !selection.directives) return selection;
          if (getDirectives({ node: selection, directiveNames: ['pagination'] }).length === 0) return selection;

          existsConnectionField = true;

          let newFieldNode = selection;
          if (newFieldNode.selectionSet) {
            const result = transformSelectionSet({
              targetFieldNames: ['edges', 'pageInfo'],
              selectionSet: newFieldNode.selectionSet,
              fragmentDefinitions: newFragmentDefinitions,
              canAddSelections: true,
            });
            newFragmentDefinitions = result.fragmentDefinitions;
            changedFragmentDefinitions = mergeFragmentDefinitions(
              changedFragmentDefinitions,
              result.changedFragmentDefinitions,
            );
            if (result.hasChangedSelectionSet) {
              newFieldNode = { ...newFieldNode, selectionSet: result.selectionSet };
            }
          }

          newFieldNode = addFieldWithoutDuplication({
            fieldNode: newFieldNode,
            additionalFields: [connectionIdField],
          });
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
  });

  return {
    documentNode: document,
    fragmentDefinitions: newFragmentDefinitions,
    changedFragmentDefinitions: changedFragmentDefinitions,
  };
};

const fieldNameToFieldNode: { [key in Exclude<ConnectionRelatedFieldName, 'edges'>]: FieldNode } = {
  id: idField,
  __typename: typenameField,
  node: nodeField,
  cursor: cursorField,
  pageInfo: pageInfoField,
};

const transformSelectionSet = (params: {
  targetFieldNames: ConnectionRelatedFieldName[];
  selectionSet: SelectionSetNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  canAddSelections: boolean;
}): {
  selectionSet: SelectionSetNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  hasChangedSelectionSet: boolean;
  fieldNamesNotInExistence: ConnectionRelatedFieldName[];
  changedFragmentDefinitions: FragmentDefinitionNode[];
} => {
  const { targetFieldNames, canAddSelections } = params;
  let fragmentDefinitions = params.fragmentDefinitions;
  let selectionSet = params.selectionSet;
  let hasChangedSelectionSet = false;
  let changedFragmentDefinitions: FragmentDefinitionNode[] = [];

  const fieldsInExistence = fieldNodesInSelections({
    fieldNames: targetFieldNames,
    selections: selectionSet.selections,
  });
  if (fieldsInExistence.length === targetFieldNames.length) {
    return {
      selectionSet,
      fragmentDefinitions,
      hasChangedSelectionSet,
      fieldNamesNotInExistence: [],
      changedFragmentDefinitions,
    };
  }

  const resultBasedOnSelections = transformSelectionSetBasedOnSelections({
    fieldsInExistence,
    selectionSet,
    fragmentDefinitions,
    canAddSelections,
  });
  selectionSet = resultBasedOnSelections.selectionSet;
  fragmentDefinitions = resultBasedOnSelections.fragmentDefinitions;
  hasChangedSelectionSet = resultBasedOnSelections.hasChangedSelectionSet;
  changedFragmentDefinitions = resultBasedOnSelections.changedFragmentDefinitions;

  const resultBasedOnSpreadFragments = transformFragmentDefinitionsBasedOnSpreadFragments({
    targetFieldNames,
    selectionSet,
    fragmentDefinitions,
  });
  changedFragmentDefinitions = mergeFragmentDefinitions(
    changedFragmentDefinitions,
    resultBasedOnSpreadFragments.changedFragmentDefinitions,
  );
  fragmentDefinitions = resultBasedOnSpreadFragments.fragmentDefinitions;
  const fieldNamesNotInExistence = resultBasedOnSpreadFragments.fieldNamesNotInExistence;

  if (fieldNamesNotInExistence.length === 0 || !canAddSelections) {
    return {
      selectionSet,
      fragmentDefinitions,
      hasChangedSelectionSet,
      fieldNamesNotInExistence,
      changedFragmentDefinitions,
    };
  }

  const newSelections = [
    ...selectionSet.selections,
    ...fieldNamesNotInExistence
      .map((name) => (name === 'edges' ? null : fieldNameToFieldNode[name]))
      .filter(nonNullable),
  ];
  return {
    selectionSet: { ...selectionSet, selections: newSelections },
    fragmentDefinitions,
    hasChangedSelectionSet: true,
    fieldNamesNotInExistence: [],
    changedFragmentDefinitions,
  };
};

const fieldNodesInSelections = ({
  fieldNames,
  selections,
}: {
  fieldNames: ConnectionRelatedFieldName[];
  selections: readonly SelectionNode[];
}) => {
  const flattenSelections = flatSelections({ selections: selections });
  return flattenSelections.filter(
    (selection): selection is FieldNode =>
      selection.kind === Kind.FIELD && !!fieldNames.find((name) => name === selection.name.value),
  );
};

const transformSelectionSetBasedOnSelections = (params: {
  selectionSet: SelectionSetNode;
  fieldsInExistence: FieldNode[];
  fragmentDefinitions: FragmentDefinitionNode[];
  canAddSelections: boolean;
}): {
  selectionSet: SelectionSetNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  hasChangedSelectionSet: boolean;
  changedFragmentDefinitions: FragmentDefinitionNode[];
  fieldsInExistence: FieldNode[];
} => {
  const { fieldsInExistence, selectionSet } = params;
  let fragmentDefinitions = params.fragmentDefinitions;
  let changedFragmentDefinitions: FragmentDefinitionNode[] = [];

  const changedFieldNodes: FieldNode[] = [];

  fieldsInExistence.forEach((field) => {
    const nextSelectionSet = field.selectionSet;
    if (!nextSelectionSet) return;
    let result: ReturnType<typeof transformSelectionSet> | undefined;
    const nextFunc = (names: ConnectionRelatedFieldName[]) =>
      transformSelectionSet({
        targetFieldNames: names,
        selectionSet: nextSelectionSet,
        fragmentDefinitions: fragmentDefinitions,
        canAddSelections: true,
      });

    if (field.name.value === 'edges') {
      result = nextFunc(['node', 'cursor']);
    } else if (field.name.value === 'node') {
      result = nextFunc(['id', '__typename']);
    } else if (field.name.value === 'pageInfo') {
      // If pageInfo exists, do not add its child fields (e.g., hasNextPage). Respect the user's writing.
    }

    if (!result) return;

    fragmentDefinitions = result.fragmentDefinitions;
    changedFragmentDefinitions = mergeFragmentDefinitions(
      changedFragmentDefinitions,
      result.changedFragmentDefinitions,
    );
    if (result.hasChangedSelectionSet) {
      changedFieldNodes.push({ ...field, selectionSet: result.selectionSet });
    }
  });

  if (changedFieldNodes.length === 0) {
    return {
      selectionSet,
      fragmentDefinitions,
      changedFragmentDefinitions,
      hasChangedSelectionSet: false,
      fieldsInExistence,
    };
  }

  // Apply changedFieldNode to selectionSet.selections
  const newSelectionSet = visit(selectionSet, {
    Field: {
      leave(field) {
        if (!field.loc) return;
        const changedFieldNode = changedFieldNodes.find(
          (changedNode) =>
            changedNode.loc && changedNode.loc.start === field.loc?.start && changedNode.loc.end === field.loc.end,
        );
        if (changedFieldNode) return changedFieldNode;
      },
    },
  });

  return {
    selectionSet: newSelectionSet,
    fragmentDefinitions,
    changedFragmentDefinitions,
    hasChangedSelectionSet: true,
    fieldsInExistence,
  };
};

const transformFragmentDefinitionsBasedOnSpreadFragments = (params: {
  targetFieldNames: ConnectionRelatedFieldName[];
  selectionSet: SelectionSetNode;
  fragmentDefinitions: FragmentDefinitionNode[];
}): {
  fragmentDefinitions: FragmentDefinitionNode[];
  changedFragmentDefinitions: FragmentDefinitionNode[];
  fieldNamesNotInExistence: ConnectionRelatedFieldName[];
} => {
  const { targetFieldNames, selectionSet } = params;
  let fragmentDefinitions = params.fragmentDefinitions;
  let changedFragmentDefinitions: FragmentDefinitionNode[] = [];

  const selections = flatSelections({ selections: selectionSet.selections });
  let fieldNamesNotInExistence = targetFieldNames.filter(
    (name) => !selections.find((selection) => selection.kind === Kind.FIELD && selection.name.value === name),
  );

  const fragmentSpreads = selections.filter(
    (selection): selection is FragmentSpreadNode => selection.kind === Kind.FRAGMENT_SPREAD,
  );
  let foundFieldNames: ConnectionRelatedFieldName[] = [];
  fragmentSpreads.forEach((spread) => {
    const definition = getFragmentDefinitionByName({ fragmentName: spread.name.value, fragmentDefinitions });
    if (!definition) return;
    const result = transformSelectionSet({
      selectionSet: definition.selectionSet,
      targetFieldNames: fieldNamesNotInExistence,
      fragmentDefinitions,
      canAddSelections: false,
    });
    fragmentDefinitions = result.fragmentDefinitions;
    changedFragmentDefinitions = mergeFragmentDefinitions(
      changedFragmentDefinitions,
      result.changedFragmentDefinitions,
    );
    if (result.hasChangedSelectionSet) {
      const newFragmentDefinition = { ...definition, selectionSet: result.selectionSet };
      changedFragmentDefinitions = mergeFragmentDefinitions(changedFragmentDefinitions, [newFragmentDefinition]);
      replaceFragmentDefinition(fragmentDefinitions, newFragmentDefinition);
    }

    const resultFoundFieldNames = fieldNamesNotInExistence.filter(
      (name) => !result.fieldNamesNotInExistence.includes(name),
    );
    foundFieldNames = [...foundFieldNames, ...resultFoundFieldNames];
  });

  fieldNamesNotInExistence = fieldNamesNotInExistence.filter((name) => !foundFieldNames.includes(name));

  return {
    fragmentDefinitions,
    fieldNamesNotInExistence,
    changedFragmentDefinitions,
  };
};

const flatSelections = ({ selections }: { selections: readonly SelectionNode[] }): SelectionNode[] => {
  return selections
    .map((selection) => {
      if (selection.kind !== Kind.INLINE_FRAGMENT) return selection;
      return flatSelections({ selections: selection.selectionSet.selections });
    })
    .flat();
};

const replaceFragmentDefinition = (
  fragmentDefinitions: FragmentDefinitionNode[],
  newFragmentDefinition: FragmentDefinitionNode,
): void => {
  const index = fragmentDefinitions.findIndex(
    (fragmentDefinition) => fragmentDefinition.name.value === newFragmentDefinition.name.value,
  );
  if (index >= 0) {
    fragmentDefinitions[index] = newFragmentDefinition;
  }
};

const mergeFragmentDefinitions = (
  a: FragmentDefinitionNode[],
  b: FragmentDefinitionNode[],
): FragmentDefinitionNode[] => {
  return [
    // Remove same name fragments
    ...a.filter((aDefinition) => !b.find((bDefinition) => bDefinition.name.value === aDefinition.name.value)),
    ...b,
  ];
};
