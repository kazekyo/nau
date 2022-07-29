import { executeCodegen } from '@graphql-codegen/cli';
import { Source } from '@graphql-tools/utils';
import { parse } from 'graphql';
import path from 'path';
import { preset } from '../preset';
import { printDocuments, testSchemaDocumentNode } from '../utils/testing/utils';

describe('preset', () => {
  it('transforms documents', async () => {
    const documents: Source[] = [
      {
        document: parse(/* GraphQL */ `
          query TestQuery($cursor: String) {
            viewer {
              ...Fragment_user @arguments(count: 5)
            }
          }
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
          fragment Fragment_user on User @argumentDefinitions(count: { type: "Int", defaultValue: 1 }) {
            items(first: $count, after: $cursor) @pagination {
              edges {
                node {
                  id
                }
              }
            }
          }
        `),
      },
    ];
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          ...Fragment_user_bi8xLGNvdW50OjU
        }
      }
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
      fragment Fragment_user_bi8xLGNvdW50OjU on User {
        items(first: 5, after: $cursor) {
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
        id
        __typename
      }
    `);

    const result = await preset.buildGeneratesSection({
      baseOutputDir: 'src/generated/graphql.ts',
      config: {},
      presetConfig: {},
      schema: testSchemaDocumentNode,
      documents: documents,
      plugins: [],
      pluginMap: {},
    });

    expect(printDocuments(result[0].documents)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  describe('generateTypeScriptCode', () => {
    it('outputs nothing code to the content when the flag is not set to true', async () => {
      const input = {
        schema: path.join(__dirname, '../utils/testing/example.graphql'),
        documents: path.join(__dirname, './fixtures/exampleFile.ts'),
        generates: {
          ['./generated.ts']: {
            preset,
            plugins: [],
          },
        },
      };

      const result = await executeCodegen(input);
      expect(result[0].content).toBe('');
    });

    it('outputs TypeScript code when the flag is true', async () => {
      const input = {
        schema: path.join(__dirname, '../utils/testing/example.graphql'),
        documents: path.join(__dirname, './fixtures/exampleFile.ts'),
        generates: {
          ['./generated.ts']: {
            preset,
            plugins: [],
            presetConfig: {
              generateTypeScriptCode: true,
            },
          },
        },
      };

      const result = await executeCodegen(input);
      expect(result[0].content).toMatchSnapshot();
    });
  });

  describe('Multiple Sections', () => {
    it('works with no errors', async () => {
      const input = {
        schema: path.join(__dirname, '../utils/testing/example.graphql'),
        generates: {
          ['./generated.ts']: {
            preset,
            plugins: [],
            presetConfig: {
              generateTypeScriptCode: true,
            },
            documents: path.join(__dirname, './fixtures/exampleFile.ts'),
          },
          ['./generated2.ts']: {
            preset,
            plugins: [],
            presetConfig: {
              generateTypeScriptCode: true,
            },
            documents: path.join(__dirname, './fixtures/exampleFile.ts'),
          },
          ['./generated3.ts']: {
            preset,
            plugins: [],
            documents: path.join(__dirname, './fixtures/exampleFile.ts'),
          },
        },
      };

      const result = await executeCodegen(input);
      expect(result.length).toBe(3);
    });
  });
});
