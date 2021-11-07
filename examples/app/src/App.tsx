import { gql } from '@apollo/client';
// import { gql } from './gql';
import { Box, Divider } from '@chakra-ui/react';
import React from 'react';
import './App.css';
import { useMyAppQueryQuery } from './generated/graphql';

const myFragment = gql`
  fragment MyFragment1_user on User
  @refetchable(queryName: "App_PaginationQuery")
  @argumentDefinitions(count: { type: "Int", defaultValue: 5 }, cursor: { type: "String" }) {
    name
    items5: items(first: $count, after: $cursor) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

gql`
  query MyAppQuery {
    viewer {
      id
      ...MyFragment1_user @arguments(count: 5)
      ...MyFragment2_user
    }
  }
  fragment MyFragment2_user on User @argumentDefinitions(count: { type: "Int", defaultValue: 3 }) {
    name
    items3: items(first: $count) {
      edges {
        node {
          id
        }
      }
    }
  }
  ${myFragment}
`;

function App() {
  const { loading, error, data } = useMyAppQueryQuery();

  if (loading) return <p>Loading...</p>;
  if (error || !data) return <p>Error :(</p>;

  return (
    <div className="App">
      <Box p="6">
        <Box pt="3" pb="2" d="flex" alignItems="baseline">
          <Box fontWeight="semibold" fontSize="xl" lineHeight="tight">
            {data.viewer?.name}'s items
          </Box>
          <Box ml="3" color="gray.500" fontWeight="semibold" fontSize="sm">
            User ID: {data.viewer?.id}
          </Box>
        </Box>
        <Divider />
        <Box mt="4">aaa</Box>
      </Box>
    </div>
  );
}

export default App;
