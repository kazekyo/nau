import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { parse } from 'graphql';
import { plugin } from '..';
import { testGraphqlSchema } from '../../../utils/testing/utils';

describe('cache-updater-support', () => {
  const documentsForPagination = [
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

  it('generates paginationMetaList code', async () => {
    const result = await plugin(testGraphqlSchema, documentsForPagination, { documentFiles: documentsForPagination });
    const merged = mergeOutputs([result]);
    validateTs(merged, undefined, false, true);
    expect(result.content).toContain(
      `export const paginationMetaList = [{ node: { typename: 'Item' }, parents: [{ typename: 'Query', connection: { fieldName: 'items' }, edge: { typename: 'ItemEdge' } }, { typename: 'User', connection: { fieldName: 'items' }, edge: { typename: 'ItemEdge' } }] }]`,
    );
  });

  it('generates withCacheUpdater code', async () => {
    const result = await plugin(testGraphqlSchema, documentsForPagination, { documentFiles: documentsForPagination });
    const merged = mergeOutputs([result]);
    validateTs(merged, undefined, false, true);
    expect(result.content).toContain(
      `
export type CacheUpdaterTypePolicies = {
  Query: TypePolicy;
  User: TypePolicy;
  [__typename: string]: TypePolicy;
};

export const withCacheUpdater = (typePolicies: CacheUpdaterTypePolicies) =>
  withCacheUpdaterInternal({
    paginationMetaList,
    deleteRecordMetaList: [],
    typePolicies,
  });`,
    );
    expect(result.prepend).toEqual([
      "import { TypePolicy } from '@apollo/client';",
      "import { withCacheUpdaterInternal } from '@nau/cache-updater';",
    ]);
  });
});
