import { parse } from 'graphql';
import { printDocuments } from '../../utils/testing/utils';
import { transform } from '../generateRefetchQuery';

describe('transform', () => {
  it('generates the refetch query', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery {
        viewer {
          ...UserFragment @arguments(count: 5)
        }
      }
      fragment UserFragment on User
      @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
      @refetchable(queryName: "TestRefetchQuery") {
        id
        items(first: $count, after: $cursor) {
          edges {
            node {
              id
            }
          }
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery {
        viewer {
          ...UserFragment @arguments(count: 5)
        }
      }
      fragment UserFragment on User
      @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
      @refetchable(queryName: "TestRefetchQuery") {
        id
        items(first: $count, after: $cursor) {
          edges {
            node {
              id
            }
          }
        }
      }
      query TestRefetchQuery($count: Int = 2, $cursor: String, $id: ID!) {
        node(id: $id) {
          id
          __typename
          ...UserFragment
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('collects all variables from fragments and defines them as variables of the query', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery {
        viewer {
          ...UserFragment1
        }
      }
      fragment UserFragment1 on User
      @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
      @refetchable(queryName: "TestRefetchQuery") {
        ...UserFragment2
        items(first: $count, after: $cursor) {
          edges {
            node {
              id
            }
          }
        }
      }
      fragment UserFragment2 on User
      @argumentDefinitions(
        iconWidth: { type: "Int", defaultValue: 100 }
        iconHeight: { type: "Int", defaultValue: 100 }
      ) {
        id
        iconImage(width: $iconWidth, height: $iconHeight)
      }
    `);

    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery {
        viewer {
          ...UserFragment1
        }
      }
      fragment UserFragment1 on User
      @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
      @refetchable(queryName: "TestRefetchQuery") {
        ...UserFragment2
        items(first: $count, after: $cursor) {
          edges {
            node {
              id
            }
          }
        }
      }
      fragment UserFragment2 on User
      @argumentDefinitions(
        iconWidth: { type: "Int", defaultValue: 100 }
        iconHeight: { type: "Int", defaultValue: 100 }
      ) {
        id
        iconImage(width: $iconWidth, height: $iconHeight)
      }
      query TestRefetchQuery(
        $count: Int = 2
        $cursor: String
        $iconWidth: Int = 100
        $iconHeight: Int = 100
        $id: ID!
      ) {
        node(id: $id) {
          id
          __typename
          ...UserFragment1
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });
});
