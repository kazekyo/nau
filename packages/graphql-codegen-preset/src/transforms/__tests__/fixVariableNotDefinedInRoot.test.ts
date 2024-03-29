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
        arg2: { type: "String" } # It will put null because it is nullable and has no default value.
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
        item(itemArg1: 10, itemArg2: null, itemArg3: $arg3, itemArg4: $arg4) {
          id
          name
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('copies the fragment definition if both operations are with and without the argument in operation variables', () => {
    const document1 = parse(/* GraphQL */ `
      query TestQuery1_1 {
        viewer {
          ...Fragment_user
        }
      }
      query RefetchQuery1_1($cursor: String!) {
        viewer {
          ...Fragment_user
        }
      }
      query RefetchQuery1_2($first: Int!, $cursor: String!) {
        viewer {
          ...Fragment_user
        }
      }
      query RefetchQuery1_3 {
        viewer {
          ...Fragment_user_wrapped
        }
      }
      query RefetchQuery1_4($first: Int!) {
        viewer {
          ...Fragment_user_wrapped
        }
      }
      fragment Fragment_user on User
      @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        items(first: $first, after: $cursor) {
          edges {
            nod {
              id
            }
          }
          pageInfo {
            endCursor
          }
        }
      }
      fragment Fragment_user_wrapped on User {
        id
        ...Fragment_user
      }
    `);

    const document2 = parse(/* GraphQL */ `
      query TestQuery2_1 {
        viewer {
          ...Fragment_user
        }
      }
      query RefetchQuery2_1($cursor: String!) {
        viewer {
          ...Fragment_user
        }
      }
      fragment Fragment_user on User
      @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        items(first: $first, after: $cursor) {
          edges {
            nod {
              id
            }
          }
          pageInfo {
            endCursor
          }
        }
      }
    `);

    const expectedDocument1 = parse(/* GraphQL */ `
      query TestQuery1_1 {
        viewer {
          ...Fragment_user
        }
      }

      query RefetchQuery1_1($cursor: String!) {
        viewer {
          ...Fragment_user_bi8zLGN1cnNvcg
        }
      }

      query RefetchQuery1_2($first: Int!, $cursor: String!) {
        viewer {
          ...Fragment_user_bi8zLGZpcnN0LGN1cnNvcg
        }
      }

      query RefetchQuery1_3 {
        viewer {
          ...Fragment_user_wrapped
        }
      }

      query RefetchQuery1_4($first: Int!) {
        viewer {
          ...Fragment_user_wrapped_bi9jaGlsZDpiaTh6TEdacGNuTjA
        }
      }

      fragment Fragment_user on User
      @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        items(first: 10, after: null) {
          edges {
            nod {
              id
            }
          }
          pageInfo {
            endCursor
          }
        }
      }

      fragment Fragment_user_wrapped on User {
        id
        ...Fragment_user
      }

      fragment Fragment_user_bi8zLGN1cnNvcg on User
      @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        items(first: 10, after: $cursor) {
          edges {
            nod {
              id
            }
          }
          pageInfo {
            endCursor
          }
        }
      }

      fragment Fragment_user_bi8zLGZpcnN0LGN1cnNvcg on User
      @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        items(first: $first, after: $cursor) {
          edges {
            nod {
              id
            }
          }
          pageInfo {
            endCursor
          }
        }
      }

      fragment Fragment_user_bi8zLGZpcnN0 on User
      @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        items(first: $first, after: null) {
          edges {
            nod {
              id
            }
          }
          pageInfo {
            endCursor
          }
        }
      }

      fragment Fragment_user_wrapped_bi9jaGlsZDpiaTh6TEdacGNuTjA on User {
        id
        ...Fragment_user_bi8zLGZpcnN0
      }
    `);

    const expectedDocument2 = parse(/* GraphQL */ `
      query TestQuery2_1 {
        viewer {
          ...Fragment_user
        }
      }

      query RefetchQuery2_1($cursor: String!) {
        viewer {
          ...Fragment_user_bi8zLGN1cnNvcg
        }
      }

      fragment Fragment_user on User
      @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        items(first: 10, after: null) {
          edges {
            nod {
              id
            }
          }
          pageInfo {
            endCursor
          }
        }
      }

      fragment Fragment_user_bi8zLGN1cnNvcg on User
      @argumentDefinitions(first: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        items(first: 10, after: $cursor) {
          edges {
            nod {
              id
            }
          }
          pageInfo {
            endCursor
          }
        }
      }
    `);
    const result = transform({ documentFiles: [{ document: document1 }, { document: document2 }] });

    expect(printDocuments([result.documentFiles[0]])).toBe(printDocuments([{ document: expectedDocument1 }]));
    expect(printDocuments([result.documentFiles[1]])).toBe(printDocuments([{ document: expectedDocument2 }]));
  });
});

describe('getQueryInfoList', () => {
  it('generates pairs fragment names and variable names', () => {
    const documentFiles: Types.DocumentFile[] = [
      {
        document: parse(/* GraphQL */ `
          query TestQuery($a: Int, $b: String) {
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
    const result = exportedForTesting.getOperationInfoList({
      documentFiles: documentFiles,
    });

    expect(result).toStrictEqual([
      {
        operationName: 'TestQuery',
        variableNames: ['a', 'b'],
        belongsFragmentNames: ['Fragment1_user', 'Fragment2_user', 'Fragment3_user'],
      },
      { operationName: undefined, variableNames: ['c', 'd'], belongsFragmentNames: ['Fragment3_user'] },
    ]);
  });
});
