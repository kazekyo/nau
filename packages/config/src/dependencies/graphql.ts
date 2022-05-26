/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as _GraphQL from 'graphql';
const mod = require.main || module;

let GraphQLModule;
try {
  console.log('-----try----');
  GraphQLModule = mod.require('graphql');
} catch {
  console.log('------cache------');
  GraphQLModule = _GraphQL;
}

export const {
  BREAK,
  GraphQLError,
  parseType,
  visit,
  isNonNullType,
  valueFromAST,
  isTypeSubTypeOf,
  getNullableType,
  typeFromAST,
  GraphQLNonNull,
  GraphQLObjectType,
  visitWithTypeInfo,
  isInputType,
  TypeInfo,
  isObjectType,
} = GraphQLModule as typeof _GraphQL;
