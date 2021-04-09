import { gql, useMutation } from '@apollo/client';
import * as React from 'react';
import { FC } from 'react';

export const RobotListItemFragments = {
  user: gql`
    fragment RobotListItem_user on User {
      id
    }
  `,
  robot: gql`
    fragment RobotListItem_robot on Robot {
      id
      name
    }
  `,
};

const REMOVE_ROBOT = gql`
  mutation RemoveRobotMutation($input: RemoveRobotInput!, $connections: [String!]!) {
    removeRobot(input: $input) {
      robot @deleteRecord {
        id
      }
    }
  }
`;

const ListItem: FC<{
  user: { id: string };
  robot: { id: string; name: string };
}> = ({ user, robot }) => {
  const [removeRobot] = useMutation(REMOVE_ROBOT);

  return (
    <>
      <span>
        Robot Id: {robot.id}, Name: {robot.name}
      </span>
      <button onClick={() => removeRobot({ variables: { input: { robotId: robot.id, userId: user.id } } })}>
        Delete
      </button>
    </>
  );
};

export default ListItem;
