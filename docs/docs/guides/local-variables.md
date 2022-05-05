---
sidebar_position: 3
---

# Local variables in Fragment

We cannot define local variables in Fragment, so a variable name must be unique across all fragments used. And if we want to set a default value for a variable used in a fragment, we have to put it as a query variable.

You can use @arguments directive and @argumentDefinitions directive to solve this issue.

These can be used to create local variables for fragments.

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
