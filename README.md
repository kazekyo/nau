<h1 align="center">
Nau 🧶
</h1>
Nau is a library that makes Apollo Client more powerful. if your server follows Relay Specification, nau will provide you with a magical developer experience.

## Our Goal
This library is inspired by Relay and we have reproduced some features of Relay.
However, the goal is not to create a full copy of Relay on Apollo Client.

Our goal is to make Apollo Client more powerful by integrating Relay Specification with Apollo Client.

## Getting Started
```
npm install @kazekyo/nau
```
> ⚠️ The package is currently under heavy development. All version updates may have breaking changes.

## Usage
Currently, there is no complete documentation.
Check [example code](https://github.com/kazekyo/nau/tree/main/example/frontend-apollo) for details.

### Setup
```ts
const splitLink = split(
  ({ query }) => isSubscriptionOperation(query),
  from([createCacheUpdaterLink(), wsLink]),
  from([createCacheUpdaterLink(), new HttpLink({ uri: 'http://localhost:4000/graphql' })]),
);

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: withCacheUpdater({
      targetTypes: ['Robot', 'RobotRemovedPayload', 'User'],
      typePolicies: {
        User: {
          fields: {
            robots: relayPaginationFieldPolicy(),
          },
        },
      },
    }),
  }),
  link: splitLink,
});
```
Now `User.robots` can be paginated. And `Robot`, `RobotRemovedPayload`, and `User` can also use our directives.

### Directives
If you want to add a data to the list, use `@appendNode`/`@prependNode` directives.
```tsx
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

const List: React.FC = () => {
  ...
  const [addRobot] = useMutation(ADD_ROBOT);
  const connectionId = generateConnectionId({ id: data.viewer.id, field: 'robots' });
  ...

  return (
    <>
      <button
        onClick={() =>
          void addRobot({
            variables: {
              input: { robotName: 'new robot', userId: data.viewer.id },
              connections: [connectionId],
              edgeTypeName: 'RobotEdge',
            },
          })
        }
      >
        Add Robot
      </button>
      ...
    </>
  );
};
```
If you want to remove data from the cache, use `@deleteRecord` directive.
```tsx
const REMOVE_ROBOT = gql`
  mutation RemoveRobotMutation($input: RemoveRobotInput!) {
    removeRobot(input: $input) {
      robot {
        id @deleteRecord
      }
    }
  }
`;
```


## TODO
- [ ] Fragment-based pagination
- [ ] Documentation
- [ ] Testing
