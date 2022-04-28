import { parse } from 'graphql';
import { printDocuments } from '../../utils/testing/utils';
import { transform } from '../addFieldsForAddingNode';

describe('transform', () => {
  it('adds fileds for @prependNode', () => {
    const document = parse(/* GraphQL */ `
      mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
        addItem(input: $input) {
          item @prependNode(connections: $connections) {
            name
          }
        }
      }

      subscription ItemAddedSubscription($connections: [String!]!) {
        itemAdded {
          item @prependNode(connections: $connections) {
            name
          }
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
        addItem(input: $input) {
          item @prependNode(connections: $connections) {
            name
            id
            __typename
          }
        }
      }

      subscription ItemAddedSubscription($connections: [String!]!) {
        itemAdded {
          item @prependNode(connections: $connections) {
            name
            id
            __typename
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('adds fileds for @appendNode', () => {
    const document = parse(/* GraphQL */ `
      mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
        addItem(input: $input) {
          item @appendNode(connections: $connections) {
            name
          }
        }
      }

      subscription ItemAddedSubscription($connections: [String!]!) {
        itemAdded {
          item @appendNode(connections: $connections) {
            name
          }
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
        addItem(input: $input) {
          item @appendNode(connections: $connections) {
            name
            id
            __typename
          }
        }
      }

      subscription ItemAddedSubscription($connections: [String!]!) {
        itemAdded {
          item @appendNode(connections: $connections) {
            name
            id
            __typename
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });
});
