import * as path from 'path';
import { clientDirectives } from './clientDirective';

export const apolloConfigClientSchemaPath = path.join(__dirname, `apollo.graphql`);
export const graphqlConfigClientSchemaPath = path.join(__dirname, `graphql-config.graphql`);

export const graphQLConfigClientSchema = (): string => {
  return generateClientSchemaString({ exclude: ['arguments', 'argumentDefinitions'] });
};

export const apolloConfigClientSchema = (): string => {
  return generateClientSchemaString({ exclude: [] });
};

const generateClientSchemaString = ({ exclude }: { exclude: string[] }): string => {
  const directives = Object.entries(clientDirectives)
    .filter(([key]) => !exclude.includes(key))
    .map(([_, str]) => str);
  return directives.join('\n');
};
