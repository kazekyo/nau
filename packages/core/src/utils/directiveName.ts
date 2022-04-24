import { FieldNode, SelectionNode } from 'graphql/language';

export type DirectiveName = 'appendNode' | 'prependNode' | 'deleteRecord';
export const INSERT_NODE_DIRECTIVE_NAMES: DirectiveName[] = ['appendNode', 'prependNode'];
export const DELETE_RECORD_DIRECTIVE_NAME = 'deleteRecord';
export const DELETE_VARIABLES_DIRECTIVE_NAMES: DirectiveName[] = [...INSERT_NODE_DIRECTIVE_NAMES];
export const CACHE_UPDATER_DIRECTIVE_NAMES: DirectiveName[] = [
  ...INSERT_NODE_DIRECTIVE_NAMES,
  DELETE_RECORD_DIRECTIVE_NAME,
];

export const findDirectiveName = ({
  fieldOrSelection,
  directiveNames,
}: {
  fieldOrSelection: FieldNode | SelectionNode | null;
  directiveNames: DirectiveName[];
}): DirectiveName | undefined => {
  const directiveName = fieldOrSelection?.directives?.find((directive) =>
    directiveNames.find((name) => name === directive.name.value),
  )?.name.value;
  if (directiveName) return directiveName as DirectiveName;
  return undefined;
};
