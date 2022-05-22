import { readFileSync } from 'fs';
import { buildSchema, GraphQLError, parse, validate } from 'graphql';
import path from 'path';
import { paginationDirectiveValidationRule } from '../paginationDirective';

const filePath = path.join(__dirname, '../../utils/testing/example.graphql');
const schemaString = readFileSync(filePath, { encoding: 'utf-8' });
const schema = buildSchema(schemaString);

const validateDocuments = (source: string) => {
  return validate(schema, parse(source), [paginationDirectiveValidationRule]);
};

describe(paginationDirectiveValidationRule, () => {
  it('allows use of @pagination directive', () => {
    const errors = validateDocuments(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
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
    expect(errors).toHaveLength(0);
  });

  it('disallows use of @pagination directive without after or before', () => {
    const errors = validateDocuments(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          items(first: 1) @pagination {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `);
    expect(errors).toStrictEqual([new GraphQLError('@pagination directive is required `after` or `before` argument.')]);
  });

  it('disallows use of @pagination directive with non-connection field', () => {
    const errors = validateDocuments(/* GraphQL */ `
      query TestQuery($cursor: String) {
        viewer {
          items(first: 1, after: $cursor) {
            edges {
              node {
                id @pagination
              }
            }
          }
        }
      }
    `);
    expect(errors).toStrictEqual([
      new GraphQLError('@pagination can only be used with types whose name ends with "Connection".'),
    ]);
  });
});
