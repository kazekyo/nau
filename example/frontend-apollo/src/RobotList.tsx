import { gql, useMutation, useQuery } from '@apollo/client';
import { getNodesFromConnection, prependNode } from '@kazekyo/apollo-relay-style-pagination';
import * as React from 'react';
import RobotListItem, { RobotListItemFragments } from './RobotListItem';

const QUERY = gql`
  query ProjectListWithCursor($cursor: String) {
    viewer {
      id
      robots(first: 2, after: $cursor) {
        edges {
          node {
            id
            ...RobotListItem_robot
          }
          cursor
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      ...RobotListItem_user
    }
  }
  ${RobotListItemFragments.robot}
  ${RobotListItemFragments.user}
`;

const ADD_ROBOT = gql`
  mutation AddRobotMutation($input: AddRobotInput!) {
    addRobot(input: $input) {
      robot {
        id
        ...RobotListItem_robot
      }
    }
  }
  ${RobotListItemFragments.robot}
`;

const List: React.FC = () => {
  const { data, error, loading, fetchMore } = useQuery(QUERY, {
    variables: { cursor: null },
  });
  const [addRobot] = useMutation(ADD_ROBOT, {
    update(cache, { data: result }) {
      const newNode = result.addRobot.robot;
      prependNode({
        node: newNode,
        fragment: RobotListItemFragments.robot,
        edgeTypename: 'RobotEdge',
        connectionInfo: {
          object: data.viewer,
          field: 'robots',
        },
        cache,
      });
    },
  });
  if (loading || error || !data) {
    return null;
  }
  if (!data) return null;

  const nodes = getNodesFromConnection({ connection: data.viewer.robots });
  const edges = data.viewer.robots.edges;

  return (
    <>
      <div>
        <button
          onClick={() => void addRobot({ variables: { input: { robotName: 'new robot', userId: data.viewer.id } } })}
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
                <RobotListItem user={data.viewer} robot={node} />
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => fetchMore({ variables: { cursor: data.viewer.robots.pageInfo.endCursor } })}
        disabled={!fetchMore || !data.viewer.robots.pageInfo.hasNextPage}
      >
        Load more
      </button>
    </>
  );
};

export default List;
