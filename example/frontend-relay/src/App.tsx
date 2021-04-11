import { graphql } from 'babel-plugin-relay/macro';
import React from 'react';
import { RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay';
import './App.css';
import environment from './relayEnviroment';
import RobotList from './RobotList';
import { AppQuery } from './__generated__/AppQuery.graphql';

const App: React.FC = () => {
  const { viewer } = useLazyLoadQuery<AppQuery>(
    graphql`
      query AppQuery {
        viewer {
          id
          name
          ...RobotList_user
        }
      }
    `,
    {},
  );
  if (!viewer) return null;
  return (
    <div className="App">
      <div>
        Viewer ID: {viewer?.id}, Name: {viewer?.name}
      </div>
      <div>
        Robots
        {viewer && <RobotList userKey={viewer} />}
      </div>
    </div>
  );
};

const Wrapper: React.FC = () => (
  <RelayEnvironmentProvider environment={environment}>
    <React.Suspense fallback={<div>Loading...</div>}>
      <App></App>
    </React.Suspense>
  </RelayEnvironmentProvider>
);
export default Wrapper;
