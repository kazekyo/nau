import { GraphQLObjectType, GraphQLOutputType, GraphQLSchema, isListType, isNonNullType, isObjectType } from 'graphql';
import { getFieldDef } from 'graphql/execution/execute';
import { Maybe } from 'graphql/jsutils/Maybe';
import { edgesField, nodeField } from './graphqlAST';

export const getConnectionType = ({ type }: { type: Maybe<GraphQLOutputType> }): GraphQLObjectType | undefined => {
  let connectionType = type;
  if (!connectionType) return;
  if (isNonNullType(connectionType)) {
    connectionType = connectionType.ofType as GraphQLObjectType;
  }
  if (!isObjectType(connectionType)) return;
  if (!connectionType.name.endsWith('Connection')) return;
  return connectionType;
};

export const getEdgeType = ({
  connectionType,
  schema,
}: {
  connectionType: GraphQLObjectType;
  schema: GraphQLSchema;
}): GraphQLObjectType | undefined => {
  const edgesFieldDef = getFieldDef(schema, connectionType, edgesField);
  if (!edgesFieldDef) return;

  let edgesType = edgesFieldDef.type;
  if (isNonNullType(edgesType)) {
    edgesType = edgesType.ofType;
  }
  if (!isListType(edgesType)) return;

  let edgeType = edgesType.ofType as Maybe<unknown>;
  if (!edgeType) return;

  if (isNonNullType(edgeType)) {
    edgeType = edgeType.ofType;
  }
  if (!isObjectType(edgeType)) return;

  return edgeType;
};

export const getNodeType = ({
  edgeType,
  schema,
}: {
  edgeType: GraphQLObjectType;
  schema: GraphQLSchema;
}): GraphQLObjectType | undefined => {
  const nodeFieldDef = getFieldDef(schema, edgeType, nodeField);
  if (!nodeFieldDef) return;

  let nodeType = nodeFieldDef.type;
  if (!nodeType) return;

  if (isNonNullType(nodeType)) {
    nodeType = nodeType.ofType;
  }
  if (!isObjectType(nodeType)) return;

  return nodeType;
};
