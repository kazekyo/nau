import { graphql } from 'babel-plugin-relay/macro';
import { Environment, commitMutation } from 'relay-runtime';
import { Disposable } from 'relay-runtime/lib/util/RelayRuntimeTypes';
import { RemoveRobotMutation } from './__generated__/RemoveRobotMutation.graphql';

const mutation = graphql`
  mutation RemoveRobotMutation($input: RemoveRobotInput!) {
    removeRobot(input: $input) {
      robot {
        id @deleteRecord
      }
    }
  }
`;

const commit = (environment: Environment, data: { robotId: string; userId: string }): Disposable => {
  return commitMutation<RemoveRobotMutation>(environment, {
    mutation,
    variables: { input: data },
    onError: (err) => console.error(err),
  });
};

const object = { commit };
export default object;
