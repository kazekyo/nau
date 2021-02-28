import { gql, useQuery } from '@apollo/client';
import React from 'react';
import './App.css';
import RobotList from './RobotList';

const APP_QUERY = gql`
  query AppQuery {
    viewer {
      id
      name
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(APP_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div className="App">
      <div>
        Viewer ID: {data.viewer?.id}, Name: {data.viewer?.name}
      </div>
      <div>
        Robots
        {data.viewer && <RobotList />}
      </div>
    </div>
  );
}

export default App;
