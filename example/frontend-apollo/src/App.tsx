import { gql, useQuery } from '@apollo/client';
import React from 'react';
import './App.css';
import RobotList, { RobotListFragments } from './RobotList';

const APP_QUERY = gql`
  query AppQuery {
    viewer {
      id
      name
      ...RobotList_user
    }
  }
  ${RobotListFragments.user}
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
        {data.viewer && <RobotList user={data.viewer} />}
      </div>
    </div>
  );
}

export default App;
