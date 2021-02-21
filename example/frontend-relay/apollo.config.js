const path = require('path');
const { config, directivesFile, includesGlobPattern } = require('vscode-apollo-relay').generateConfig();

module.exports = {
  client: {
    ...config.client,
    service: {
      ...config.client.service,
      localSchemaFile: './schema/schema.graphql',
    },
    includes: [directivesFile, path.join('./src', includesGlobPattern(['js', 'jsx', 'ts', 'tsx']))],
  },
};
