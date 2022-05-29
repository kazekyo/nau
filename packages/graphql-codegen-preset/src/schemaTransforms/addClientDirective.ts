import { extendSchema, GraphQLSchema, parse } from 'graphql';
import { clientDirectives } from '@kazekyo/nau-config';

export const addCustomClientDirective = (schema: GraphQLSchema): { schema: GraphQLSchema } => {
  const currentDirectives = schema.getDirectives();
  const additionalDirectives = Object.entries(clientDirectives)
    .filter(([key, _]) => !currentDirectives.find((d) => d.name === key))
    .map(([_, value]) => value);

  if (additionalDirectives.length === 0) {
    return { schema };
  }

  return { schema: extendSchema(schema, parse(additionalDirectives.join('\n'))) };
};
