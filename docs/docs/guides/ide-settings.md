---
title: IDE Settings
---


```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```


Nau supports [Apollo Config](https://www.apollographql.com/docs/devtools/apollo-config/) and [GraphQL Config](https://www.graphql-config.com/). We are testing works with VS Code extensions [Apollo GraphQL Extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) and [GraphQL Extension](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql).

This `@kazekyo/nau-config` package can provide directives knowledge to your IDE.

# Installation
````mdx-code-block
<Tabs>
<TabItem value="npm">

```bash
npm install --save-dev @kazekyo/nau-config
```

</TabItem>
<TabItem value="yarn">

```bash
yarn add --dev @kazekyo/nau-config
```

</TabItem>
</Tabs>
````


# Apollo Config
```js title="apollo.config.js"
// highlight-start
const { apollo } = require('@kazekyo/nau-config');
const config = apollo.generateConfig();
// highlight-end
module.exports = {
  client: {
    // highlight-next-line
    ...config.client,
    service: {
      name: 'example-app',
      url: 'http://localhost:4000/graphql',
    },
  },
};
```

See [here](https://www.apollographql.com/docs/devtools/editor-plugins/) for how to set up `apollo.config.js`.

# GraphQL Config
```js title="graphql.config.js"
// highlight-start
const { graphqlConfig } = require('@kazekyo/nau-config');
// highlight-end
module.exports = {
  // highlight-next-line
  schema: ['http://localhost:4000/graphql', graphqlConfig.clientSchemaPath],
  documents: 'src/**/*.{graphql,js,ts,jsx,tsx}',
};
```

See [here](https://www.graphql-config.com/docs/user/user-introduction) for how to set up `graphql.config.js`.
