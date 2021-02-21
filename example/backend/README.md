http://localhost:4000/graphql

```graphql
query AllFetchQuery {
  viewer {
    id
    name
    robots {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}

mutation AddRobotMutation {
  addRobot(input: {robotName: "new robot", userId: "VXNlcjox"}) {
    robot {
      id
      name
    }
  }
}

mutation UpdateRobotMutation {
  updateRobot(input: {newRobotName: "updated robot", robotId: "cm9ib3Q6MQ=="}) {
    robot {
      id
      name
    }
  }
}

mutation RemoveRobotMutation {
  removeRobot(input: {robotId: "cm9ib3Q6MQ==", userId: "VXNlcjox"}) {
    robot {
      id
      name
    }
  }
}
```
