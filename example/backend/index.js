const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  execute,
  subscribe,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require('graphql');
const {
  nodeDefinitions,
  globalIdField,
  fromGlobalId,
  mutationWithClientMutationId,
  connectionFromArray,
  connectionArgs,
  connectionDefinitions,
} = require('graphql-relay');
const cors = require('cors');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { createServer } = require('http');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const user1 = {
  id: '1',
  name: 'User #1',
  robots: ['1', '2', '3', '4', '5'],
};

const user2 = {
  id: '2',
  name: 'User #2',
  robots: ['6', '7', '8'],
};

const data = {
  user: {
    1: user1,
    2: user2,
  },
  robot: {
    1: { id: 1, name: 'robot #1' },
    2: { id: 2, name: 'robot #2' },
    3: { id: 3, name: 'robot #3' },
    4: { id: 4, name: 'robot #4' },
    5: { id: 5, name: 'robot #5' },
    6: { id: 6, name: 'robot #6' },
    7: { id: 7, name: 'robot #7' },
    8: { id: 8, name: 'robot #8' },
  },
};

function getRobot(id) {
  return data.robot[id];
}

function getUser(id) {
  return data.user[id];
}

let nextRobot = 9;
function createRobot(robotName, userGlobalId) {
  const newRobot = {
    id: String(nextRobot++),
    name: robotName,
  };
  const { _type, id: userId } = fromGlobalId(userGlobalId);
  data.robot[newRobot.id] = newRobot;
  data.user[userId].robots.push(newRobot.id);
  pubsub.publish(ROBOT_ADDED_TOPIC, newRobot);
  return newRobot;
}

function updateRobot(newRobotName, robotGlobalId) {
  const { _type, id: robotId } = fromGlobalId(robotGlobalId);
  const robot = data.robot[robotId];
  data.robot[robotId] = { ...robot, name: newRobotName };
  return data.robot[robotId];
}

function deleteRobot(robotGlobalId, userGlobalId) {
  const { _typeRobot, id: robotId } = fromGlobalId(robotGlobalId);
  const { _typeUser, id: userId } = fromGlobalId(userGlobalId);
  const deletedRobot = data.robot[robotId];
  delete data.robot[robotId];
  data.user[userId].robots = data.user[userId].robots.filter((id) => id !== robotId);
  pubsub.publish(ROBOT_REMOVED_TOPIC, robotGlobalId);
  return deletedRobot;
}

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    switch (type) {
      case 'Robot':
        return getRobot(id);
      case 'User':
        return getUser(id);
    }
  },
  (obj) => (obj.robots ? userType : robotType),
);

const robotType = new GraphQLObjectType({
  name: 'Robot',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField(),
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the robot.',
    },
  }),
});

const { connectionType: robotConnection } = connectionDefinitions({
  nodeType: robotType,
});

const userType = new GraphQLObjectType({
  name: 'User',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField(),
    name: {
      type: GraphQLString,
      description: 'The name of the user.',
    },
    robots: {
      type: robotConnection,
      args: { ...connectionArgs, keyword: { type: GraphQLString } },
      resolve: (user, args) => {
        const robots = user.robots.map(getRobot);
        const array = args.keyword ? robots.filter((robot) => robot.name.match(args.keyword)) : robots;
        return connectionFromArray(array, args);
      },
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: userType,
      resolve: () => user1,
    },
    node: nodeField,
  }),
});

const addRobotMutation = mutationWithClientMutationId({
  name: 'AddRobot',
  inputFields: {
    robotName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  outputFields: {
    robot: {
      type: new GraphQLNonNull(robotType),
      resolve: (payload) => getRobot(payload.robotId),
    },
  },
  mutateAndGetPayload: ({ robotName, userId }) => {
    const newRobot = createRobot(robotName, userId);
    return {
      robotId: newRobot.id,
    };
  },
});

const updateRobotMutation = mutationWithClientMutationId({
  name: 'UpdateRobot',
  inputFields: {
    newRobotName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    robotId: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  outputFields: {
    robot: {
      type: new GraphQLNonNull(robotType),
      resolve: (payload) => getRobot(payload.robotId),
    },
  },
  mutateAndGetPayload: ({ newRobotName, robotId }) => {
    const robot = updateRobot(newRobotName, robotId);
    return {
      robotId: robot.id,
    };
  },
});

const removeRobotMutation = mutationWithClientMutationId({
  name: 'RemoveRobot',
  inputFields: {
    robotId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  outputFields: {
    robot: {
      type: new GraphQLNonNull(robotType),
      resolve: (payload) => payload.robot,
    },
  },
  mutateAndGetPayload: ({ robotId, userId }) => {
    const deletedRobot = deleteRobot(robotId, userId);
    return {
      robot: deletedRobot,
    };
  },
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addRobot: addRobotMutation,
    updateRobot: updateRobotMutation,
    removeRobot: removeRobotMutation,
  }),
});

const ROBOT_ADDED_TOPIC = 'robot_added_topic';
const ROBOT_REMOVED_TOPIC = 'robot_removed_topic';

const robotAddedPayloadType = new GraphQLObjectType({
  name: 'RobotAddedPayload',
  fields: {
    robot: {
      type: new GraphQLNonNull(robotType),
      resolve: (source) => source,
    },
  },
});

const robotRemovedPayloadType = new GraphQLObjectType({
  name: 'RobotRemovedPayload',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (source) => source,
    },
  },
});

const subscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    robotAdded: {
      type: new GraphQLNonNull(robotAddedPayloadType),
      subscribe: () => pubsub.asyncIterator(ROBOT_ADDED_TOPIC),
      resolve: (source) => source,
    },
    robotRemoved: {
      type: new GraphQLNonNull(robotRemovedPayloadType),
      subscribe: () => pubsub.asyncIterator(ROBOT_REMOVED_TOPIC),
      resolve: (source) => source,
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
  subscription: subscriptionType,
});

const app = express();
app.use(cors());
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: { subscriptionEndpoint: `ws://localhost:4000/subscriptions` },
  }),
);
const ws = createServer(app);
ws.listen(4000, () => {
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: ws,
      path: '/subscriptions',
    },
  );
});
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
