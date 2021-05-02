import { FieldNode, SelectionNode } from 'graphql/language';

export type DirectiveName = 'appendNode' | 'prependNode' | 'deleteRecord';
export const INSERT_NODE_DIRECTIVE_NAMES: DirectiveName[] = ['appendNode', 'prependNode'];
export const CUSTOM_DIRECTIVE_NAMES: DirectiveName[] = [...INSERT_NODE_DIRECTIVE_NAMES, 'deleteRecord'];

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
