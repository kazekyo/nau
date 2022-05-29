const fs = require('fs');
const clientSchema = require('../dist/clientSchema');

const apolloClientSchema = clientSchema.apolloClientSchema();
const graphQLConfigClientSchema = clientSchema.graphQLConfigClientSchema();

fs.writeFileSync(clientSchema.apolloConfigClientSchemaPath, apolloClientSchema);
fs.writeFileSync(clientSchema.graphqlConfigClientSchemaPath, graphQLConfigClientSchema);
