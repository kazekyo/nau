# @argumentDefinitions

The `@argumentDefinitions` allows you to define fragment-specific variables. You can also set default values for the variables.

```graphql
fragment foo on Foo @argumentDefinitions(arg1: { type: "String!" }, arg2: { type: "Int!", defaultValue: 0 }) {
    foo(a: $arg1, b: $arg2) {
      id
      name
    }
  }
`;
```
