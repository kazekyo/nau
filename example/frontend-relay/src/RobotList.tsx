import { graphql } from 'babel-plugin-relay/macro';
import * as React from 'react';
import { createPaginationContainer, RelayPaginationProp } from 'react-relay';
import AddRobotMutation from './AddRobotMutation';
import environment from './relayEnviroment';
import RobotListItem from './RobotListItem';
import { RobotList_user } from './__generated__/RobotList_user.graphql';

const List: React.FC<{
  user: RobotList_user;
  relay: RelayPaginationProp;
}> = ({ user, relay }) => {
  const loadMore = () => {
    if (!relay.hasMore() || relay.isLoading()) return;
    relay.loadMore(2, (error) => error && console.log('error!'));
  };
  if (!user.robots) return null;
  const edges = user.robots.edges || [];
  const connectionId = user.robots.__id;

  return (
    <>
      <div>
        <button
          onClick={() =>
            AddRobotMutation.commit(environment, { robotName: 'new robot', userId: user.id }, [connectionId])
          }
        >
          Add Robot
        </button>
      </div>
      <div>
        {edges.map((edge, i) => {
          if (!edge || !edge.node) return null;
          return (
            <div key={edge.node.id}>
              <div>
                Edge cursor: ${edge.cursor},
                <RobotListItem user={user} robot={edge.node} />
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={loadMore} disabled={!relay.hasMore()}>
        Load more
      </button>
    </>
  );
};

export default createPaginationContainer(
  List,
  {
    user: graphql`
      fragment RobotList_user on User
      @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" }) {
        id
        robots(first: $count, after: $cursor) @connection(key: "RobotList_robots", filters: []) {
          __id
          edges {
            node {
              id
              ...RobotListItem_robot
            }
            cursor
          }
        }
        ...RobotListItem_user
      }
    `,
  },
  {
    direction: 'forward',
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        count,
        cursor,
        userId: props.user.id,
      };
    },
    query: graphql`
      query RobotList_PaginationQuery($count: Int!, $cursor: String, $userId: ID!) {
        user: node(id: $userId) {
          ...RobotList_user @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
