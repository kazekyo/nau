/* eslint-disable react-hooks/rules-of-hooks */
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';
import { PubSub } from 'graphql-subscriptions';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

type User = { id: number; name: string; items: number[]; type: 'User' };
type Item = { id: number; name: string; type: 'Item' };

type Node = User | Item;

const pubsub = new PubSub();

const user1: User = {
  id: 1,
  name: 'Alice',
  items: [1, 2, 3, 4, 5],
  type: 'User',
};

const user2: User = {
  id: 2,
  name: 'Bob',
  items: [6, 7, 8],
  type: 'User',
};
const itemIdsAccessibleByAll = [9, 10];

const data: { user: { [index: number]: User }; item: { [index: number]: Item } } = {
  user: {
    1: user1,
    2: user2,
  },
  item: {
    1: { id: 1, name: 'item #1', type: 'Item' },
    2: { id: 2, name: 'item #2', type: 'Item' },
    3: { id: 3, name: 'item #3', type: 'Item' },
    4: { id: 4, name: 'item #4', type: 'Item' },
    5: { id: 5, name: 'item #5', type: 'Item' },
    6: { id: 6, name: 'item #6', type: 'Item' },
    7: { id: 7, name: 'item #7', type: 'Item' },
    8: { id: 8, name: 'item #8', type: 'Item' },
    9: { id: 9, name: 'item #9', type: 'Item' },
    10: { id: 10, name: 'item #10', type: 'Item' },
  },
};

function getItem(id: number) {
  return data.item[id];
}

function getUser(id: number) {
  return data.user[id];
}

let nextItem = 9;
function createItem(itemName: string, userGlobalId: string) {
  const newItem: Item = {
    id: nextItem++,
    name: itemName,
    type: 'Item',
  };
  const { id: userStringId } = fromGlobalId(userGlobalId);
  const userId = parseInt(userStringId);
  data.item[newItem.id] = newItem;
  data.user[userId].items.push(newItem.id);
  pubsub.publish(ROBOT_ADDED_TOPIC, newItem);
  return newItem;
}

function updateItem(newItemName: string, itemGlobalId: string) {
  const { id: itemStringId } = fromGlobalId(itemGlobalId);
  const itemId = parseInt(itemStringId);
  const item = data.item[itemId];
  data.item[itemId] = { ...item, name: newItemName };
  return data.item[itemId];
}

function removeItem(itemGlobalId: string, userGlobalId: string) {
  const { id: itemStringId } = fromGlobalId(itemGlobalId);
  const { id: userStringId } = fromGlobalId(userGlobalId);
  const itemId = parseInt(itemStringId);
  const userId = parseInt(userStringId);
  const deletedItem = data.item[itemId];
  delete data.item[itemId];
  data.user[userId].items = data.user[userId].items.filter((id) => id !== itemId);
  pubsub.publish(ROBOT_REMOVED_TOPIC, { id: deletedItem.id });
  return deletedItem;
}

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id: stringId } = fromGlobalId(globalId);
    const id = parseInt(stringId);
    switch (type) {
      case 'Item':
        return getItem(id);
      case 'User':
        return getUser(id);
      default:
        return null;
    }
  },
  (obj: Node) => obj.type,
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
      resolve: (user: User, args) => {
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
const httpServer = createServer(app);
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/subscription',
});

const serverCleanup = useServer({ schema }, wsServer);

let server: ApolloServer;
async function startServer() {
  server = new ApolloServer({
    schema,
    csrfPrevention: true,
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();
  server.applyMiddleware({ app });
}
startServer();

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/subscription`);
});
