export const ARGUMENT_DEFINITIONS_DIRECTIVE_NAME = 'argumentDefinitions';
export const ARGUMENTS_DIRECTIVE_NAME = 'arguments';
export const REFETCHABLE_DIRECTIVE_NAME = 'refetchable';
export const PAGINATION_DIRECTIVE_NAME = 'pagination';

export const customDirectives = {
  arguments: 'directive @arguments on FRAGMENT_SPREAD',
  argumentDefinitions: 'directive @argumentDefinitions on FRAGMENT_DEFINITION',
  refetchable: 'directive @refetchable(queryName: String!) on FRAGMENT_DEFINITION',
  pagination: 'directive @pagination on FIELD',
  appendNode: 'directive @appendNode(connections: [String!]) on FIELD',
  prependNode: 'directive @prependNode(connections: [String!]) on FIELD',
  deleteRecord: 'directive @deleteRecord(typename: String!) on FIELD',
};
