const fs = require('fs');
const clientSchema = require('../dist/clientSchema');

const apolloConfigClientSchema = clientSchema.apolloConfigClientSchema();
const graphQLConfigClientSchema = clientSchema.graphQLConfigClientSchema();

fs.writeFileSync(clientSchema.apolloConfigClientSchemaPath, apolloConfigClientSchema);
fs.writeFileSync(clientSchema.graphqlConfigClientSchemaPath, graphQLConfigClientSchema);
