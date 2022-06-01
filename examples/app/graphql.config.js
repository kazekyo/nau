const { graphqlConfig } = require('@kazekyo/nau-config');

module.exports = {
  schema: ['http://localhost:4000/graphql', graphqlConfig.clientSchemaPath],
  documents: 'src/**/*.{graphql,js,ts,jsx,tsx}',
};
