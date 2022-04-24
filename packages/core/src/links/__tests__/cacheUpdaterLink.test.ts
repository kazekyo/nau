import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import { print } from 'graphql/language';
import { createCacheUpdaterLink } from '../cacheUpdaterLink';

describe('cacheUpdaterLink', () => {
  const subjectLink = createCacheUpdaterLink();
  it('removes directives and related variables from the mutation operation', (done) => {
    const document = gql`
      mutation Mutation($connections: [String!]!) {
        foo @prependNode(connections: $connections) {
          id
        }
        bar @appendNode(connections: $connections) {
          id
        }
        id @deleteRecord(typename: "Foo")
      }
    `;
    const expectedDocument = gql`
      mutation Mutation {
        foo {
          id
        }
        bar {
          id
        }
        id
      }
    `;
    const variables = { connections: ['dummyId'], other: 'ok' };
    const expectedVariables = { other: 'ok' };

    const successMockData = { data: { success: 'ok' } };
    const mockLink = new ApolloLink((operation) => {
      expect(print(operation.query)).toBe(print(expectedDocument));
      expect(operation.variables).toMatchObject(expectedVariables);
      return Observable.of(successMockData);
    });
    const link = subjectLink.concat(mockLink);
    execute(link, { query: document, variables }).subscribe((result) => {
      expect(result).toBe(successMockData);
      done();
    });
  });
});
