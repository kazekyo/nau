import { graphql } from 'babel-plugin-relay/macro';
import * as React from 'react';
import { FC } from 'react';
import { useFragment, useMutation } from 'react-relay';
import { RobotListItem_RemoveRobotMutation } from './__generated__/RobotListItem_RemoveRobotMutation.graphql';
import { RobotListItem_robot$key } from './__generated__/RobotListItem_robot.graphql';
import { RobotListItem_user$key } from './__generated__/RobotListItem_user.graphql';

const ListItem: FC<{
  userKey: RobotListItem_user$key;
  robotKey: RobotListItem_robot$key;
}> = ({ userKey, robotKey }) => {
  const user = useFragment<RobotListItem_user$key>(
    graphql`
      fragment RobotListItem_user on User {
        id
      }
    `,
    userKey,
  );

  const robot = useFragment<RobotListItem_robot$key>(
    graphql`
      fragment RobotListItem_robot on Robot {
        id
        name
      }
    `,
    robotKey,
  );

  const [commit, isCommiting] = useMutation<RobotListItem_RemoveRobotMutation>(graphql`
    mutation RobotListItem_RemoveRobotMutation($input: RemoveRobotInput!) {
      removeRobot(input: $input) {
        robot {
          id @deleteRecord
        }
      }
    }
  `);
  return (
    <>
      <span>
        Robot Id: {robot.id}, Name: {robot.name}
      </span>
      <button
        onClick={() => {
          commit({
            variables: { input: { robotId: robot.id, userId: user.id } },
            onError: (err) => console.error(err),
          });
        }}
        disabled={isCommiting}
      >
        Delete
      </button>
    </>
  );
};
export default ListItem;
