import { gql, useQuery } from '@apollo/client';
import { Box, Divider } from '@chakra-ui/react';
import React from 'react';
import './App.css';
import List, { ListFragments } from './List';

const APP_QUERY = gql`
  query AppQuery {
    viewer {
      id
      name
      ...List_user
    }
  }
  ${ListFragments.user}
`;

function App() {
  const { loading, error, data } = useQuery(APP_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

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
        <Box mt="4">{data.viewer && <List user={data.viewer} />}</Box>
      </Box>
    </div>
  );
}

export default App;
