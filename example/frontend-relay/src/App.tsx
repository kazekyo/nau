import React from 'react';
import './App.css';
import { QueryRenderer } from 'react-relay';
import environment from './relayEnviroment';
import { AppQuery } from './__generated__/AppQuery.graphql';
import { graphql } from 'babel-plugin-relay/macro';
import RobotList from './RobotList';

const query = graphql`
  query AppQuery {
    viewer {
      id
      name
      ...RobotList_user
    }
  }
`;

function App() {
  return (
    <div className="App">
      <QueryRenderer<AppQuery>
        environment={environment}
        query={query}
        variables={{}}
        render={({ error, props }) => {
          if (error) {
            return <div>Error!</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return (
            <>
              <div>
                Viewer ID: {props.viewer?.id}, Name: {props.viewer?.name}
              </div>
              <div>
                Robots
                {props.viewer && <RobotList user={props.viewer} />}
              </div>
            </>
          );
        }}
      />
    </div>
  );
}

export default App;