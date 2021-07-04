import { ApolloLink, disableFragmentWarnings, execute, gql, Observable } from '@apollo/client';
import { print } from 'graphql/language';
import { createArgumentDefinitionsLink } from '../argumentDefinitionsLink';

disableFragmentWarnings();

jest.mock('nanoid', () => {
  return {
    customAlphabet: () => () => 'random',
  };
});

describe('argumentDefinitionsLink', () => {
  const subjectLink = createArgumentDefinitionsLink();
  it('changes the query', (done) => {
    const query = gql`
      query TestQuery($input: ID!) {
        foo {
          ...bar @arguments(arg1: 1, arg2: "str", arg3: $input)
        }
      }
      fragment bar on Bar
      @argumentDefinitions(arg1: { type: "Int!", defaultValue: 0 }, arg2: { type: "String" }, arg3: { type: "ID!" }) {
        baz(a: $arg1, b: $arg2, c: $arg3) {
          id
        }
      }
    `;
    const changedQuery = gql`
      query TestQuery($input: ID!) {
        foo {
          ...bar_random
        }
      }
      fragment bar_random on Bar {
        baz(a: 1, b: "str", c: $input) {
          id
        }
      }
    `;
    const successMockData = { data: { success: 'ok' } };
    const mockLink = new ApolloLink((operation) => {
      expect(print(operation.query)).toBe(print(changedQuery));
      return Observable.of(successMockData);
    });
    const link = subjectLink.concat(mockLink);
    execute(link, { query }).subscribe((result) => {
      expect(result).toBe(successMockData);
      done();
    });
  });
  it('fills arguments with default value', (done) => {
    const query = gql`
      query TestQuery {
        foo {
          ...bar
        }
      }
      fragment bar on Bar @argumentDefinitions(arg1: { type: "Int!", defaultValue: 100 }) {
        baz(a: $arg1) {
          id
        }
      }
    `;

    const changedQuery = gql`
      query TestQuery {
        foo {
          ...bar
        }
      }
      fragment bar on Bar {
        baz(a: 100) {
          id
        }
      }
    `;
    const successMockData = { data: { success: 'ok' } };
    const mockLink = new ApolloLink((operation) => {
      expect(print(operation.query)).toBe(print(changedQuery));
      return Observable.of(successMockData);
    });
    const link = subjectLink.concat(mockLink);
    execute(link, { query }).subscribe((result) => {
      expect(result).toBe(successMockData);
      done();
    });
  });
});
