/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type RobotList_PaginationQueryVariables = {
    count?: number | null;
    cursor?: string | null;
    keyword?: string | null;
    id: string;
};
export type RobotList_PaginationQueryResponse = {
    readonly node: {
        readonly " $fragmentRefs": FragmentRefs<"RobotList_user">;
    } | null;
};
export type RobotList_PaginationQuery = {
    readonly response: RobotList_PaginationQueryResponse;
    readonly variables: RobotList_PaginationQueryVariables;
};



/*
query RobotList_PaginationQuery(
  $count: Int = 2
  $cursor: String
  $keyword: String
  $id: ID!
) {
  node(id: $id) {
    __typename
    ...RobotList_user_2BDVGC
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

fragment RobotList_user_2BDVGC on User {
  id
  robots(first: $count, after: $cursor, keyword: $keyword) {
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
var v0 = {
  "defaultValue": 2,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cursor"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "keyword"
},
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v5 = {
  "kind": "Variable",
  "name": "keyword",
  "variableName": "keyword"
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  },
  (v5/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RobotList_PaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
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
              },
              (v5/*: any*/)
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "RobotList_PaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v8/*: any*/),
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
                          (v7/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          },
                          (v6/*: any*/)
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
                "args": (v8/*: any*/),
                "filters": [
                  "keyword"
                ],
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
    "cacheID": "23b086157bad7a7a9f801e4533656dfd",
    "id": null,
    "metadata": {},
    "name": "RobotList_PaginationQuery",
    "operationKind": "query",
    "text": "query RobotList_PaginationQuery(\n  $count: Int = 2\n  $cursor: String\n  $keyword: String\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RobotList_user_2BDVGC\n    id\n  }\n}\n\nfragment RobotListItem_robot on Robot {\n  id\n  name\n}\n\nfragment RobotListItem_user on User {\n  id\n}\n\nfragment RobotList_user_2BDVGC on User {\n  id\n  robots(first: $count, after: $cursor, keyword: $keyword) {\n    edges {\n      node {\n        id\n        ...RobotListItem_robot\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  ...RobotListItem_user\n}\n"
  }
};
})();
(node as any).hash = '329a881d05e0e2ab2d0e6cd8eb95ea53';
export default node;
