import { parse, printSchema } from 'graphql';
import { testGraphqlSchema } from '../../utils/testing/utils';
import { addConnectionId } from '../addConnectionId';
describe('addConnectionId', () => {
  const documentFiles = [
    {
      document: parse(/* GraphQL */ `
        query TestQuery($cursor1: String, $cursor2: String, $cursor3: String) {
          itemsOnRoot: items(first: 1, after: $cursor1, keyword: "test") @pagination {
            edges {
              node {
                id
                __typename
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          viewer {
            id
            ...Fragment_user
            myItems: items(first: 1, after: $cursor2, keyword: "test2") @pagination {
              edges {
                node {
                  name
                  id
                  __typename
                }
                cursor
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
        fragment Fragment_user on User {
          id
          itemsOnFragment: items(first: 1, after: $cursor2, keyword: "test3") @pagination {
            edges {
              node {
                name
                id
                __typename
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `),
    },
  ];
  it('adds the connectionId field to the connection type with @pagination attached', () => {
    const before = `
"""A connection to a list of items."""
type ItemConnection {
  """A list of edges."""
  edges: [ItemEdge]

  """Information to aid in pagination."""
  pageInfo: PageInfo!
}`;
    expect(printSchema(testGraphqlSchema)).toContain(before);
    const result = addConnectionId(testGraphqlSchema, documentFiles);
    const after = `
"""A connection to a list of items."""
type ItemConnection {
  """A list of edges."""
  edges: [ItemEdge]

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """Information of the connection for a client"""
  _connectionId: String!
}`;
    expect(printSchema(result.schema)).toContain(after);
  });
});
