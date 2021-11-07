export const ARGUMENT_DEFINITIONS_DIRECTIVE_NAME = 'argumentDefinitions';
export const ARGUMENTS_DIRECTIVE_NAME = 'arguments';
export const REFETCHABLE_DIRECTIVE_NAME = 'refetchable';

export const customDirectives = {
  arguments: 'directive @arguments on FRAGMENT_SPREAD',
  argumentDefinitions: 'directive @argumentDefinitions on FRAGMENT_DEFINITION',
  refetchable: 'directive @refetchable(queryName: String) on FRAGMENT_DEFINITION',
};
