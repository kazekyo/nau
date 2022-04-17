import { parse } from 'graphql';
import { printDocuments } from '../../utils/testing/utils';
import { transform } from '../passArgumentValueToFragment';

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
          ...UserFragment_bi8xLGFyZzE6MSxhcmcyOiIyIixhcmczOiR0ZXN0TnVtYmVy
            @arguments(arg1: 1, arg2: "2", arg3: $testNumber)
        }
      }
      fragment UserFragment_bi8xLGFyZzE6MSxhcmcyOiIyIixhcmczOiR0ZXN0TnVtYmVy on User
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

  it('copies the fragment definition with @arguments attached if there are both a spreading fragment with @arguments attached and a spreading fragment without @arguments attached', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery1 {
        viewer {
          ...UserFragment @arguments(arg1: 1)
        }
      }
      query TestQuery2 {
        viewer {
          ...UserFragment
        }
      }
      query TestQuery3 {
        viewer {
          ...UserFragment
        }
      }
      query TestQuery4 {
        viewer {
          ...UserFragment_wrapped
        }
      }
      fragment UserFragment on User @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }) {
        id
        item(itemArg1: $arg1) {
          id
        }
      }
      fragment UserFragment_wrapped on User {
        ...UserFragment @arguments(arg1: 2)
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery1 {
        viewer {
          ...UserFragment_bi8xLGFyZzE6MQ @arguments(arg1: 1)
        }
      }
      query TestQuery2 {
        viewer {
          ...UserFragment
        }
      }
      query TestQuery3 {
        viewer {
          ...UserFragment
        }
      }
      query TestQuery4 {
        viewer {
          ...UserFragment_wrapped
        }
      }
      fragment UserFragment_bi8xLGFyZzE6MQ on User @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }) {
        id
        item(itemArg1: 1) {
          id
        }
      }
      fragment UserFragment on User @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }) {
        id
        item(itemArg1: $arg1) {
          id
        }
      }
      fragment UserFragment_bi8xLGFyZzE6Mg on User @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }) {
        id
        item(itemArg1: 2) {
          id
        }
      }
      fragment UserFragment_wrapped on User {
        ...UserFragment_bi8xLGFyZzE6Mg @arguments(arg1: 2)
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });

  it('deletes the original fragment definition if @arguments is attached to all spreading fragments', () => {
    const document = parse(/* GraphQL */ `
      query TestQuery1 {
        viewer {
          ...UserFragment @arguments(arg1: 1)
        }
      }
      query TestQuery2 {
        viewer {
          ...UserFragment @arguments(arg1: 2)
        }
      }
      fragment UserFragment on User @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }) {
        id
        item(itemArg1: $arg1) {
          id
        }
      }
    `);
    const expectedDocument = parse(/* GraphQL */ `
      query TestQuery1 {
        viewer {
          ...UserFragment_bi8xLGFyZzE6MQ @arguments(arg1: 1)
        }
      }
      query TestQuery2 {
        viewer {
          ...UserFragment_bi8xLGFyZzE6Mg @arguments(arg1: 2)
        }
      }
      fragment UserFragment_bi8xLGFyZzE6MQ on User @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }) {
        id
        item(itemArg1: 1) {
          id
        }
      }
      fragment UserFragment_bi8xLGFyZzE6Mg on User @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 }) {
        id
        item(itemArg1: 2) {
          id
        }
      }
    `);
    const result = transform({ documentFiles: [{ document }] });

    expect(printDocuments(result.documentFiles)).toBe(printDocuments([{ document: expectedDocument }]));
  });
});
