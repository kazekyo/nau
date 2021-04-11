import { graphql } from 'babel-plugin-relay/macro';
import * as React from 'react';
import { useMutation, usePaginationFragment } from 'react-relay';
import RobotListItem from './RobotListItem';
import { RobotList_AddRobotMutation } from './__generated__/RobotList_AddRobotMutation.graphql';
import { RobotList_PaginationQuery } from './__generated__/RobotList_PaginationQuery.graphql';
import { RobotList_user$key } from './__generated__/RobotList_user.graphql';

const List: React.FC<{
  userKey: RobotList_user$key;
}> = ({ userKey }) => {
  const { data: user, loadNext, hasNext, isLoadingNext } = usePaginationFragment<
    RobotList_PaginationQuery,
    RobotList_user$key
  >(
    graphql`
      fragment RobotList_user on User
      @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
      @refetchable(queryName: "RobotList_PaginationQuery") {
        id
        robots(first: $count, after: $cursor) @connection(key: "RobotList_robots") {
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
    userKey,
  );

  const [commit, isCommiting] = useMutation<RobotList_AddRobotMutation>(graphql`
    mutation RobotList_AddRobotMutation($input: AddRobotInput!, $connections: [ID!]!) {
      addRobot(input: $input) {
        robot @prependNode(connections: $connections, edgeTypeName: "RobotEdge") {
          id
          ...RobotListItem_robot
        }
      }
    }
  `);

  const loadMore = () => {
    if (!hasNext || isLoadingNext) return;
    loadNext(2);
  };
  if (!user.robots) return null;
  const { robots } = user;
  const edges = robots.edges || [];
  const connectionId = robots.__id;

  return (
    <>
      <div>
        <button
          onClick={() => {
            commit({
              variables: { input: { robotName: 'new robot', userId: user.id }, connections: [connectionId] },
              onError: (err) => console.error(err),
            });
          }}
          disabled={isCommiting}
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
                Edge cursor: {edge.cursor},
                <RobotListItem userKey={user} robotKey={edge.node} />
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={loadMore} disabled={!hasNext}>
        Load more
      </button>
    </>
  );
};

export default List;
