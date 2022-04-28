import { FieldNode, SelectionNode } from 'graphql/language';

export type DirectiveName =
  | 'appendNode'
  | 'prependNode'
  | 'deleteRecord'
  | 'argumentDefinitions'
  | 'arguments'
  | 'refetchable'
  | 'pagination';

export const ARGUMENT_DEFINITIONS_DIRECTIVE_NAME = 'argumentDefinitions';
export const ARGUMENTS_DIRECTIVE_NAME = 'arguments';
export const REFETCHABLE_DIRECTIVE_NAME = 'refetchable';
export const PAGINATION_DIRECTIVE_NAME = 'pagination';
export const DELETE_RECORD_DIRECTIVE_NAME = 'deleteRecord';
export const INSERT_NODE_DIRECTIVE_NAMES: DirectiveName[] = ['appendNode', 'prependNode'];
export const DELETE_VARIABLES_DIRECTIVE_NAMES: DirectiveName[] = [...INSERT_NODE_DIRECTIVE_NAMES];
export const CACHE_UPDATER_DIRECTIVE_NAMES: DirectiveName[] = [
  ...INSERT_NODE_DIRECTIVE_NAMES,
  DELETE_RECORD_DIRECTIVE_NAME,
];

export const findDirectiveName = ({
  node,
  directiveNames,
}: {
  node: FieldNode | SelectionNode | null;
  directiveNames: DirectiveName[];
}): DirectiveName | undefined => {
  const directiveName = node?.directives?.find((directive) =>
    directiveNames.find((name) => name === directive.name.value),
  )?.name.value;
  if (directiveName) return directiveName as DirectiveName;
  return undefined;
};
