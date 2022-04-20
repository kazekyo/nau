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
  name: 'Alice',
  items: ['1', '2', '3', '4', '5'],
};

const user2 = {
  id: '2',
  name: 'Bob',
  items: ['6', '7', '8'],
};
const itemIdsAccessibleByAll = ['9', '10'];

const data = {
  user: {
    1: user1,
    2: user2,
  },
  item: {
    1: { id: 1, name: 'item #1' },
    2: { id: 2, name: 'item #2' },
    3: { id: 3, name: 'item #3' },
    4: { id: 4, name: 'item #4' },
    5: { id: 5, name: 'item #5' },
    6: { id: 6, name: 'item #6' },
    7: { id: 7, name: 'item #7' },
    8: { id: 8, name: 'item #8' },
    9: { id: 9, name: 'item #9' },
    10: { id: 10, name: 'item #10' },
  },
};

function getItem(id) {
  return data.item[id];
}

function getUser(id) {
  return data.user[id];
}

let nextItem = 9;
function createItem(itemName, userGlobalId) {
  const newItem = {
    id: String(nextItem++),
    name: itemName,
  };
  const { id: userId } = fromGlobalId(userGlobalId);
  data.item[newItem.id] = newItem;
  data.user[userId].items.push(newItem.id);
  pubsub.publish(ROBOT_ADDED_TOPIC, newItem);
  return newItem;
}

function updateItem(newItemName, itemGlobalId) {
  const { id: itemId } = fromGlobalId(itemGlobalId);
  const item = data.item[itemId];
  data.item[itemId] = { ...item, name: newItemName };
  return data.item[itemId];
}

function removeItem(itemGlobalId, userGlobalId) {
  const { id: itemId } = fromGlobalId(itemGlobalId);
  const { id: userId } = fromGlobalId(userGlobalId);
  const deletedItem = data.item[itemId];
  delete data.item[itemId];
  data.user[userId].items = data.user[userId].items.filter((id) => id !== itemId);
  pubsub.publish(ROBOT_REMOVED_TOPIC, { id: deletedItem.id });
  return deletedItem;
}

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    switch (type) {
      case 'Item':
        return getItem(id);
      case 'User':
        return getUser(id);
      default:
        return null;
    }
  },
  (obj) => (obj.items ? userType : itemType),
);

const itemType = new GraphQLObjectType({
  name: 'Item',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField(),
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the item.',
    },
  }),
});

const { connectionType: itemConnection } = connectionDefinitions({
  nodeType: itemType,
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
    items: {
      type: new GraphQLNonNull(itemConnection),
      args: { ...connectionArgs, keyword: { type: GraphQLString } },
      resolve: (user, args) => {
        const items = user.items.map(getItem);
        const array = args.keyword ? items.filter((item) => item.name.match(args.keyword)) : items;
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
    items: {
      type: new GraphQLNonNull(itemConnection),
      args: { ...connectionArgs, keyword: { type: GraphQLString } },
      resolve: (_, args) => {
        const items = itemIdsAccessibleByAll.map(getItem);
        const array = args.keyword ? items.filter((item) => item.name.match(args.keyword)) : items;
        return connectionFromArray(array, args);
      },
    },
  }),
});

const addItemMutation = mutationWithClientMutationId({
  name: 'AddItem',
  inputFields: {
    itemName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  outputFields: {
    item: {
      type: new GraphQLNonNull(itemType),
      resolve: (payload) => getItem(payload.itemId),
    },
  },
  mutateAndGetPayload: ({ itemName, userId }) => {
    const newItem = createItem(itemName, userId);
    return {
      itemId: newItem.id,
    };
  },
});

const updateItemMutation = mutationWithClientMutationId({
  name: 'UpdateItem',
  inputFields: {
    newItemName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    itemId: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  outputFields: {
    item: {
      type: new GraphQLNonNull(itemType),
      resolve: (payload) => getItem(payload.itemId),
    },
  },
  mutateAndGetPayload: ({ newItemName, itemId }) => {
    const item = updateItem(newItemName, itemId);
    return {
      itemId: item.id,
    };
  },
});

const removedItemType = new GraphQLObjectType({
  name: 'RemovedItem',
  fields: {
    id: globalIdField('Item'),
  },
});

const removeItemMutation = mutationWithClientMutationId({
  name: 'RemoveItem',
  inputFields: {
    itemId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  outputFields: {
    removedItem: {
      type: new GraphQLNonNull(removedItemType),
      resolve: (payload) => payload.removedItem,
    },
  },
  mutateAndGetPayload: ({ itemId, userId }) => {
    const removedItem = removeItem(itemId, userId);
    return {
      removedItem,
    };
  },
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addItem: addItemMutation,
    updateItem: updateItemMutation,
    removeItem: removeItemMutation,
  }),
});

const ROBOT_ADDED_TOPIC = 'item_added_topic';
const ROBOT_REMOVED_TOPIC = 'item_removed_topic';

const itemAddedPayloadType = new GraphQLObjectType({
  name: 'ItemAddedPayload',
  fields: {
    item: {
      type: new GraphQLNonNull(itemType),
      resolve: (source) => source,
    },
  },
});

const itemRemovedPayloadType = new GraphQLObjectType({
  name: 'ItemRemovedPayload',
  fields: {
    id: globalIdField('Item'),
  },
});

const subscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    itemAdded: {
      type: new GraphQLNonNull(itemAddedPayloadType),
      subscribe: () => pubsub.asyncIterator(ROBOT_ADDED_TOPIC),
      resolve: (source) => source,
    },
    itemRemoved: {
      type: new GraphQLNonNull(itemRemovedPayloadType),
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
