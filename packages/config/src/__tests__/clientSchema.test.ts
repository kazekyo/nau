import { apolloConfigClientSchema, graphQLConfigClientSchema } from '../clientSchema';

describe('apolloClientSchema', () => {
  it('returns a client schema for apollo.config.js', () => {
    expect(apolloConfigClientSchema()).toBe(`directive @arguments on FRAGMENT_SPREAD
directive @argumentDefinitions on FRAGMENT_DEFINITION
directive @refetchable(queryName: String!) on FRAGMENT_DEFINITION
directive @pagination on FIELD
directive @appendNode(connections: [String!]) on FIELD
directive @prependNode(connections: [String!]) on FIELD
directive @deleteRecord(typename: String!) on FIELD
directive @client on FIELD`);
  });
});

describe('graphQLConfigClientSchema', () => {
  it('returns a client schema for graphql.config.js', () => {
    expect(graphQLConfigClientSchema()).toBe(`directive @refetchable(queryName: String!) on FRAGMENT_DEFINITION
directive @pagination on FIELD
directive @appendNode(connections: [String!]) on FIELD
directive @prependNode(connections: [String!]) on FIELD
directive @deleteRecord(typename: String!) on FIELD
directive @client on FIELD`);
  });
});
