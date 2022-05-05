import { gql, useQuery } from '@apollo/client';
import { Box, Divider } from '@chakra-ui/react';
import React from 'react';
import './App.css';
import { AppQueryDocument } from './generated/graphql';
import List from './List';

gql`
  query AppQuery {
    viewer {
      id
      ...List_user
    }
  }
`;

const App: React.FC = () => {
  const { loading, error, data } = useQuery(AppQueryDocument);

  if (loading || !data) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div className="App">
      <Box p="6">
        <Box pt="3" pb="2" d="flex" alignItems="baseline">
          <Box fontWeight="semibold" fontSize="xl" lineHeight="tight">
            My items
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
};

export default App;
