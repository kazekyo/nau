---
sidebar_position: 1
title: Installation
---

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

You can install packages.

````mdx-code-block
<Tabs>
<TabItem value="npm">

```bash
npm install @nau/core
npm install --save-dev @nau/graphql-codegen-preset
```

</TabItem>
<TabItem value="yarn">

```bash
yarn add @nau/core
yarn add --dev @nau/graphql-codegen-preset
```

</TabItem>
</Tabs>
````


You need **Apollo Client** and **GraphQL Code Generator** to use Nau. And GraphQL Code Generator plugins such as `typescript`, `typescript-operations`, `typed-document-node`, `fragment-matcher`, and `schema-ast` are strongly recommended.

If you have not installed them, do so.

````mdx-code-block
<Tabs>
<TabItem value="npm">

```bash
npm install @apollo/client graphql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/fragment-matcher @graphql-codegen/schema-ast @graphql-codegen/typed-document-node @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

</TabItem>
<TabItem value="yarn">

```bash
yarn add @apollo/client graphql
yarn add --dev @graphql-codegen/cli @graphql-codegen/fragment-matcher @graphql-codegen/schema-ast @graphql-codegen/typed-document-node @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

</TabItem>
</Tabs>
````
