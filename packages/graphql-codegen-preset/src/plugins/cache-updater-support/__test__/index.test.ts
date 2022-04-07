import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { parse } from 'graphql';
import { plugin } from '..';
import { testGraphqlSchema } from '../../../utils/testing/utils';

describe('cache-updater-support', () => {
  describe('generatePaginationMetaList', () => {
    it('generates a paginationMetaList from documents', async () => {
      const documents = [
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
      const result = await plugin(testGraphqlSchema, documents, { documentFiles: documents });
      const merged = mergeOutputs([result]);
      validateTs(merged, undefined, false, true);
      expect(result.content).toContain(
        `export const paginationMetaList = [{ node: { typename: 'Item' }, parents: [{ typename: 'Query', connection: { fieldName: 'items' }, edge: { typename: 'ItemEdge' } }, { typename: 'User', connection: { fieldName: 'items' }, edge: { typename: 'ItemEdge' } }] }]`,
      );
      expect(result).toMatchSnapshot();
    });
  });
});
