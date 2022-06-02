const { apolloConfig } = require('@kazekyo/nau-config');

const config = apolloConfig.generateConfig();
module.exports = {
  client: {
    ...config.client,
    service: {
      name: 'example-app',
      url: 'http://localhost:4000/graphql',
    },
  },
};
