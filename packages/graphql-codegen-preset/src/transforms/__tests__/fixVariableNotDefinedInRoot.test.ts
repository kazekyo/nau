import { Types } from '@graphql-codegen/plugin-helpers';
import { parse } from 'graphql';
import { printDocuments } from '../../utils/testing/utils';
import { exportedForTesting, transform } from '../fixVariableNotDefinedInRoot';

describe('transform', () => {
  it('fix variables not defined in root based on argumentDefinitions', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($arg4: Int) {
        viewer {
          ...Fragment_user
        }
      }
      fragment Fragment_user on User
      @argumentDefinitions(
        arg1: { type: "Int", defaultValue: 10 } # It will put 10.
        arg2: { type: "String" } # It will remove the argument because it is nullable and has no default value.
        arg3: { type: "Int!" } # It will not do anything because it has no default value and it is not nullable.
        arg4: { type: "String" } # It will not do anything because it's in root variables.
      ) {
        id
        item(itemArg1: $arg1, itemArg2: $arg2, itemArg3: $arg3, itemArg4: $arg4) {
          id
          name
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($arg4: Int) {
        viewer {
          ...Fragment_user
        }
      }
      fragment Fragment_user on User
      @argumentDefinitions(
        arg1: { type: "Int", defaultValue: 10 }
        arg2: { type: "String" }
        arg3: { type: "Int!" }
        arg4: { type: "String" }
      ) {
        id
        item(itemArg1: 10, itemArg3: $arg3, itemArg4: $arg4) {
          id
          name
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });
});

describe('getQueryNamesPairs', () => {
  it('generates pairs fragment names and variable names', () => {
    const documentFiles: Types.DocumentFile[] = [
      {
        document: parse(/* GraphQL */ `
          query ($a: Int, $b: String) {
            viewer {
              ...Fragment1_user
              ...Fragment2_user
            }
          }
          fragment Fragment1_user on User {
            id
          }
        `),
      },
      {
        document: parse(/* GraphQL */ `
          fragment Fragment2_user on User {
            id
            ...Fragment3_user
          }
        `),
      },
      {
        document: parse(/* GraphQL */ `
          fragment Fragment3_user on User {
            id
          }
        `),
      },
      {
        document: parse(/* GraphQL */ `
          query ($c: Boolean, $d: Int!) {
            viewer {
              ...Fragment3_user
            }
          }
          fragment Fragment1_user on User {
            id
          }
        `),
      },
    ];
    const result = exportedForTesting.getQueryNamesPairs({
      documentFiles: documentFiles,
    });

    expect(result).toEqual([
      { variableNames: ['a', 'b'], fragmentNames: ['Fragment1_user', 'Fragment2_user', 'Fragment3_user'] },
      { variableNames: ['c', 'd'], fragmentNames: ['Fragment3_user'] },
    ]);
  });
});
