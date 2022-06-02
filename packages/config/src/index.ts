import { apolloConfigClientSchemaPath, graphqlConfigClientSchemaPath } from './clientSchema';
import { generateApolloConfig } from './apolloConfig';

export * from './validationRules';
export * from './clientDirective';

export const graphqlConfig = {
  clientSchemaPath: graphqlConfigClientSchemaPath,
};

export const apolloConfig = {
  generateConfig: generateApolloConfig,
  clientSchemaPath: apolloConfigClientSchemaPath,
};
