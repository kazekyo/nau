import { gql, useQuery } from '@apollo/client';
import React from 'react';
import './App.css';
import RobotList from './RobotList';

const APP_QUERY = gql`
  query AppQuery {
    viewer {
      id
      name
      # ...RobotList_user
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

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
