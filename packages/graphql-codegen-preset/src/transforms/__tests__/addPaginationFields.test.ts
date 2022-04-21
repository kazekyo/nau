import { parse } from 'graphql';
import { printDocuments } from '../../utils/testing/utils';
import { transform } from '../addPaginationFields';

describe('transform', () => {
  it('adds fileds related to @pagination', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
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
              hasPreviousPage
              startCursor
            }
            _connectionId @client
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('adds fields, even if @pagination is on a fragment', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          ...Fragment_user
        }
      }
      fragment Fragment_user on User {
        id
        items(first: 1, after: $cursor) @pagination {
          edges {
            node {
              name
            }
          }
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          ...Fragment_user
        }
      }
      fragment Fragment_user on User {
        id
        items(first: 1, after: $cursor) @pagination {
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
            hasPreviousPage
            startCursor
          }
          _connectionId @client
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('adds fields, even if the node is given an alias.', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          ...Fragment_user
        }
      }
      fragment Fragment_user on User {
        id
        items(first: 1, after: $cursor) @pagination {
          edges {
            item: node {
              name
            }
          }
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          ...Fragment_user
        }
      }
      fragment Fragment_user on User {
        id
        items(first: 1, after: $cursor) @pagination {
          edges {
            item: node {
              name
              id
              __typename
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
          }
          _connectionId @client
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('does not add fields if there are already fields', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
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
              hasPreviousPage
              startCursor
            }
            _connectionId @client
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document }]));
  });

  it('does not add pageInfo field if there are already exists', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
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
        }
      }
    `);

    // hasPreviousPage and startCursor are not added
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
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
            _connectionId @client
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('does not add id field if there are already exists', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `);

    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
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
              hasPreviousPage
              startCursor
            }
            _connectionId @client
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('does not add _connectionId field if there are already exists', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
            edges {
              node {
                id
              }
            }
            _connectionId
          }
        }
      }
    `);

    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          id
          items(first: 1, after: $cursor) @pagination {
            edges {
              node {
                id
                __typename
              }
              cursor
            }
            _connectionId
            pageInfo {
              hasNextPage
              endCursor
              hasPreviousPage
              startCursor
            }
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });
});
