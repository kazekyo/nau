export const customDirectives = {
  arguments: 'directive @arguments on FRAGMENT_SPREAD',
  argumentDefinitions: 'directive @argumentDefinitions on FRAGMENT_DEFINITION',
  refetchable: 'directive @refetchable(queryName: String!) on FRAGMENT_DEFINITION',
  pagination: 'directive @pagination on FIELD',
  appendNode: 'directive @appendNode(connections: [String!]) on FIELD',
  prependNode: 'directive @prependNode(connections: [String!]) on FIELD',
  deleteRecord: 'directive @deleteRecord(typename: String!) on FIELD',
  client: 'directive @client on FIELD',
};
