/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type RobotList_PaginationQueryVariables = {
    count: number;
    cursor?: string | null;
    userId: string;
};
export type RobotList_PaginationQueryResponse = {
    readonly user: {
        readonly " $fragmentRefs": FragmentRefs<"RobotList_user">;
    } | null;
};
export type RobotList_PaginationQuery = {
    readonly response: RobotList_PaginationQueryResponse;
    readonly variables: RobotList_PaginationQueryVariables;
};



/*
query RobotList_PaginationQuery(
  $count: Int!
  $cursor: String
  $userId: ID!
) {
  user: node(id: $userId) {
    __typename
    ...RobotList_user_1G22uz
    id
  }
}

fragment RobotListItem_robot on Robot {
  id
  name
}

fragment RobotListItem_user on User {
  id
}

fragment RobotList_user_1G22uz on User {
  id
  robots(first: $count, after: $cursor) {
    edges {
      node {
        id
        ...RobotListItem_robot
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
  ...RobotListItem_user
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cursor"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "userId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "userId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RobotList_PaginationQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "count",
                "variableName": "count"
              },
              {
                "kind": "Variable",
                "name": "cursor",
                "variableName": "cursor"
              }
            ],
            "kind": "FragmentSpread",
            "name": "RobotList_user"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RobotList_PaginationQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v4/*: any*/),
                "concreteType": "RobotConnection",
                "kind": "LinkedField",
                "name": "robots",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RobotEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Robot",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          },
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PageInfo",
                    "kind": "LinkedField",
                    "name": "pageInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "endCursor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasNextPage",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "kind": "ClientExtension",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__id",
                        "storageKey": null
                      }
                    ]
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v4/*: any*/),
                "filters": [],
                "handle": "connection",
                "key": "RobotList_robots",
                "kind": "LinkedHandle",
                "name": "robots"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a5d63fe584924fba1567abbbf99e6789",
    "id": null,
    "metadata": {},
    "name": "RobotList_PaginationQuery",
    "operationKind": "query",
    "text": "query RobotList_PaginationQuery(\n  $count: Int!\n  $cursor: String\n  $userId: ID!\n) {\n  user: node(id: $userId) {\n    __typename\n    ...RobotList_user_1G22uz\n    id\n  }\n}\n\nfragment RobotListItem_robot on Robot {\n  id\n  name\n}\n\nfragment RobotListItem_user on User {\n  id\n}\n\nfragment RobotList_user_1G22uz on User {\n  id\n  robots(first: $count, after: $cursor) {\n    edges {\n      node {\n        id\n        ...RobotListItem_robot\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  ...RobotListItem_user\n}\n"
  }
};
})();
(node as any).hash = 'fe2305760851bb084454b6373a0810d8';
export default node;