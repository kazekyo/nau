import { parse } from 'graphql';
import { printDocuments } from '../../utils/testing/utils';
import { transform } from '../removeCustomDirective';

describe('transform', () => {
  it('removes custom directives', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          ...UserFragment @arguments(arg: 1)
        }
      }
      fragment UserFragment on User
      @refetchable(queryName: "RefetchQuery")
      @argumentDefinitions(arg: { type: "Int", defaultValue: 10 }) {
        id
        items(first: 1, after: $cursor) @pagination {
          edges {
            node {
              id
            }
          }
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          ...UserFragment
        }
      }
      fragment UserFragment on User {
        id
        items(first: 1, after: $cursor) {
          edges {
            node {
              id
            }
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });
});
