import { Types } from '@graphql-codegen/plugin-helpers';
import { FragmentDefinitionNode, parse } from 'graphql';
import { printDocuments } from '../../utils/testing/utils';
import { exportedForTesting, transform } from '../passArgumentValueToFragment';

describe('transform', () => {
  it('changes the documents', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery($testNumber: Int!) {
        viewer {
          ...UserFragment @arguments(arg1: 1, arg2: "2", arg3: $testNumber)
        }
      }
      fragment UserFragment on User
      @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }, arg2: { type: "String" }, arg3: { type: "Int!" }) {
        id
        item(itemArg1: $arg1, itemArg2: $arg2, itemArg3: $arg3) {
          id
          name
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery($testNumber: Int!) {
        viewer {
          ...UserFragment @arguments(arg1: 1, arg2: "2", arg3: $testNumber)
        }
      }
      fragment UserFragment on User
      @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }, arg2: { type: "String" }, arg3: { type: "Int!" }) {
        id
        item(itemArg1: 1, itemArg2: "2", itemArg3: $testNumber) {
          id
          name
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('changes nested fragments', () => {
    const documentFiles: Types.DocumentFile[] = [
      {
        document: parse(/* GraphQL */ `
          query {
            viewer {
              ...Fragment1_user @arguments(arg: 1)
              ...Fragment2_user @arguments(arg: 2)
            }
          }
          fragment Fragment1_user on User @argumentDefinitions(arg: { type: "Int" }) {
            id
            item(itemArg: $arg) {
              id
            }
          }
        `),
      },
      {
        document: parse(/* GraphQL */ `
          fragment Fragment2_user on User @argumentDefinitions(arg: { type: "Int" }) {
            id
            item(itemArg: $arg) {
              id
            }
            ...Fragment3_user @arguments(arg: $arg)
          }
        `),
      },
      {
        document: parse(/* GraphQL */ `
          fragment Fragment3_user on User @argumentDefinitions(arg: { type: "Int" }) {
            id
            item(itemArg: $arg) {
              id
            }
          }
        `),
      },
    ];

    const expectedDocumentFiles: Types.DocumentFile[] = [
      {
        document: parse(/* GraphQL */ `
          query {
            viewer {
              ...Fragment1_user @arguments(arg: 1)
              ...Fragment2_user @arguments(arg: 2)
            }
          }
          fragment Fragment1_user on User @argumentDefinitions(arg: { type: "Int" }) {
            id
            item(itemArg: 1) {
              id
            }
          }
        `),
      },
      {
        document: parse(/* GraphQL */ `
          fragment Fragment2_user on User @argumentDefinitions(arg: { type: "Int" }) {
            id
            item(itemArg: 2) {
              id
            }
            ...Fragment3_user @arguments(arg: 2)
          }
        `),
      },
      {
        document: parse(/* GraphQL */ `
          fragment Fragment3_user on User @argumentDefinitions(arg: { type: "Int" }) {
            id
            item(itemArg: 2) {
              id
            }
          }
        `),
      },
    ];

    const result = transform({ documentFiles: documentFiles });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments(expectedDocumentFiles));
  });
});

describe('replaceChangedFragments', () => {
  it('replaces fragments in DocumentFiles', () => {
    const documentFiles: Types.DocumentFile[] = [
      {
        document: parse(/* GraphQL */ `
          query {
            viewer {
              ...Fragment1_user_changed
              ...Fragment2_user_changed
              ...Fragment3_user_changed_1
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
    ];
    const resultDocumentFiles = exportedForTesting.replaceChangedFragments({
      documentFiles: documentFiles,
      changedFragments: {
        Fragment1_user: parse(/* GraphQL */ `
          fragment Fragment1_user_changed on User {
            id
          }
        `).definitions as FragmentDefinitionNode[],
        Fragment2_user: parse(/* GraphQL */ `
          fragment Fragment2_user_changed on User {
            id
            ...Fragment3_user_changed_2
          }
        `).definitions as FragmentDefinitionNode[],
        Fragment3_user: parse(/* GraphQL */ `
          fragment Fragment3_user_changed_1 on User {
            id
          }
          fragment Fragment3_user_changed_2 on User {
            id
          }
        `).definitions as FragmentDefinitionNode[],
      },
    });

    const expectedDocumentFiles: Types.DocumentFile[] = [
      {
        document: parse(/* GraphQL */ `
          query {
            viewer {
              ...Fragment1_user
              ...Fragment2_user
              ...Fragment3_user_changed_1
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
            ...Fragment3_user_changed_2
          }
        `),
      },
      {
        // If there are 2 fragments or more, the unique name will be kept
        document: parse(/* GraphQL */ `
          fragment Fragment3_user_changed_1 on User {
            id
          }
          fragment Fragment3_user_changed_2 on User {
            id
          }
        `),
      },
    ];

    expect(printDocuments(resultDocumentFiles)).toBe(printDocuments(expectedDocumentFiles));
  });
});
