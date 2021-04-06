import { graphql } from 'babel-plugin-relay/macro';
import { Environment, commitMutation } from 'relay-runtime';
import { Disposable } from 'relay-runtime/lib/util/RelayRuntimeTypes';
import { AddRobotMutation } from './__generated__/AddRobotMutation.graphql';

const mutation = graphql`
  mutation AddRobotMutation($input: AddRobotInput!, $connections: [ID!]!, $edgeTypeName: String!) {
    addRobot(input: $input) {
      robot @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        id
        ...RobotListItem_robot
      }
    }
  }
`;

const commit = (
  environment: Environment,
  data: { robotName: string; userId: string },
  connections: string[],
): Disposable => {
  return commitMutation<AddRobotMutation>(environment, {
    mutation,
    variables: { input: data, connections, edgeTypeName: 'RobotEdge' },
    onError: (err) => console.error(err),
  });
};

const object = { commit };
export default object;
