import { graphql } from 'babel-plugin-relay/macro';
import * as React from 'react';
import { FC } from 'react';
import { createFragmentContainer } from 'react-relay';
import environment from './relayEnviroment';
import RemoveRobotMutation from './RemoveRobotMutation';
import { RobotListItem_robot } from './__generated__/RobotListItem_robot.graphql';
import { RobotListItem_user } from './__generated__/RobotListItem_user.graphql';

const ListItem: FC<{
  user: RobotListItem_user;
  robot: RobotListItem_robot;
}> = ({ user, robot }) => {
  return (
    <>
      <span>
        Robot Id: {robot.id}, Name: {robot.name}
      </span>
      <button onClick={() => RemoveRobotMutation.commit(environment, { robotId: robot.id, userId: user.id })}>
        Delete
      </button>
    </>
  );
};

export default createFragmentContainer(ListItem, {
  user: graphql`
    fragment RobotListItem_user on User {
      id
    }
  `,
  robot: graphql`
    fragment RobotListItem_robot on Robot {
      id
      name
    }
  `,
});
