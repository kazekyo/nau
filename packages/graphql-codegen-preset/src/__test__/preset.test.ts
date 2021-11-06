import { Source } from '@graphql-tools/utils';
import { readFileSync } from 'fs';
import { parse } from 'graphql';
import { preset } from '../preset';
import { printDocuments } from '../utils/testing/utils';
import path from 'path';

describe('buildGeneratesSection', () => {
  it('transforms documents', async () => {
    const documents: Source[] = [
      {
        document: parse(/* GraphQL */ `
          query TestQuery {
            viewer {
              id
              ...Fragment_user @arguments(count: 5)
            }
          }
        `),
      },
      {
        document: parse(/* GraphQL */ `
          fragment Fragment_user on User @argumentDefinitions(count: { type: "Int", defaultValue: 1 }) {
            items(first: $count) {
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
      query TestQuery {
        viewer {
          id
          ...Fragment_user
        }
      }
      fragment Fragment_user on User {
        items(first: 5) {
          edges {
            node {
              id
            }
          }
        }
      }
    `);

    const filePath = path.join(__dirname, '../utils/testing/example.graphql');
    const schemaString = readFileSync(filePath, { encoding: 'utf-8' });
    const schemaDocumentNode = parse(schemaString);

    const result = await preset.buildGeneratesSection({
      baseOutputDir: 'src/generated/graphql.ts',
      config: {},
      presetConfig: {},
      schema: schemaDocumentNode,
      documents: documents,
      plugins: [],
      pluginMap: {},
    });

    expect(printDocuments(result[0].documents)).toBe(printDocuments([{ document: expectedDocument }]));
  });
});
