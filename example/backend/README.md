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

query FetchUser {
  node(id: "VXNlcjox") {
    id
    ... on User {
      name
    }
  }
}


query FetchRobot {
  node(id: "Um9ib3Q6NQ==") {
    id
    ... on Robot {
      name
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
  updateRobot(input: {newRobotName: "updated robot", robotId: "Um9ib3Q6NQ=="}) {
    robot {
      id
      name
    }
  }
}

mutation RemoveRobotMutation {
  removeRobot(input: {robotId: "Um9ib3Q6NQ==", userId: "VXNlcjox"}) {
    robot {
      id
      name
    }
  }
}
```
