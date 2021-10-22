import { parse } from 'graphql';
import { printDocuments } from '../../utils/testing/utils';
import removeCustomDirective from '../removeCustomDirective';

describe('removeCustomDirective', () => {
  it('removes custom directives', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery {
        viewer {
          ...UserFragment @arguments(arg: 1)
        }
      }
      fragment UserFragment on User
      @refetchable(queryName: "RefetchQuery")
      @argumentDefinitions(arg: { type: "Int", defaultValue: 10 }) {
        id
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery {
        viewer {
          ...UserFragment
        }
      }
      fragment UserFragment on User {
        id
      }
    `);
    const result = removeCustomDirective({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });
});
