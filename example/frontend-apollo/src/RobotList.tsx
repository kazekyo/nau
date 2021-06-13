import { gql, useMutation, useSubscription } from '@apollo/client';
import { generateConnectionId, getNodesFromConnection, usePaginationFragment } from '@kazekyo/nau';
import * as React from 'react';
import RobotListItem, { RobotListItemFragments } from './RobotListItem';

export const RobotListFragments = {
  user: gql`
    fragment RobotList_user on User
    @argumentDefinitions(
      count: { type: "Int", defaultValue: 2 }
      cursor: { type: "String" }
      keyword: { type: "String" }
    )
    @refetchable(queryName: "RobotList_PaginationQuery") {
      id
      robots(first: $count, after: $cursor, keyword: $keyword) @nauConnection {
        edges {
          node {
            id
            ...RobotListItem_robot
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      ...RobotListItem_user
    }
    ${RobotListItemFragments.user}
    ${RobotListItemFragments.robot}
  `,
};

const ADD_ROBOT = gql`
  mutation AddRobotMutation($input: AddRobotInput!, $connections: [String!]!, $edgeTypeName: String!) {
    addRobot(input: $input) {
      robot @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        id
        ...RobotListItem_robot
      }
    }
  }
  ${RobotListItemFragments.robot}
`;

const ROBOT_ADDED_SUBSCRIPTION = gql`
  subscription RobotAddedSubscription($connections: [String!]!, $edgeTypeName: String!) {
    robotAdded {
      robot @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        id
        name
      }
    }
  }
`;

const ROBOT_REMOVED_SUBSCRIPTION = gql`
  subscription RobotAddedSubscription {
    robotRemoved {
      id @deleteRecord
    }
  }
`;

const Subscription: React.FC<{ userId: string }> = ({ userId }) => {
  const connectionId = generateConnectionId({ id: userId, field: 'robots' });

  useSubscription(ROBOT_ADDED_SUBSCRIPTION, {
    variables: {
      connections: [connectionId],
      edgeTypeName: 'RobotEdge',
    },
  });

  useSubscription(ROBOT_REMOVED_SUBSCRIPTION);
  return <></>;
};

type RobotsType = { edges: { node: { id: string; name: string }; cursor: string }[] };
type ReturnType = { robots: RobotsType };

const List: React.FC<{
  user: { id: string };
}> = ({ user }) => {
  const [addRobot] = useMutation(ADD_ROBOT);
  const paginationData = usePaginationFragment<ReturnType>({
    id: user.id,
    fragment: RobotListFragments.user,
    fragmentName: 'RobotList_user',
  });
  const { loadNext, hasNext, data } = paginationData;
  if (!data) return null;
  const { robots } = data;

  const connectionId = generateConnectionId({ id: user.id, field: 'robots' });
  const nodes = getNodesFromConnection({ connection: robots });
  const edges = robots.edges;

  return (
    <>
      <Subscription userId={user.id} />
      <div>
        <button
          onClick={() =>
            void addRobot({
              variables: {
                input: { robotName: 'new robot', userId: user.id },
                connections: [connectionId],
                edgeTypeName: 'RobotEdge',
              },
            })
          }
        >
          Add Robot
        </button>
      </div>
      <div>
        {nodes.map((node, i) => {
          return (
            <div key={node.id}>
              <div>
                Edge cursor: {edges[i].cursor},
                <RobotListItem user={user} robot={node} />
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => loadNext(2)} disabled={!hasNext}>
        Load more
      </button>
    </>
  );
};

export default List;
