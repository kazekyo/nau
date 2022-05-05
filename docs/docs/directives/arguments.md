# @arguments

Use the `@arguments` directive to pass variables to fragments.

```graphql
query MyQuery($myName: String!) {
  foo {
    ...bar1 @arguments(name: $myName)
    ...bar2 @arguments(name: "your name")
  }
}

fragment bar1 on Bar @argumentDefinitions(name: { type: "String!" }) {
  field1(name: $name) {
    id
  }
}

fragment bar2 on Bar @argumentDefinitions(name: { type: "String!" }) {
  field2(name: $name) {
    id
  }
}
```
