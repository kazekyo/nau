/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type AddRobotInput = {
    robotName: string;
    userId: string;
    clientMutationId?: string | null;
};
export type RobotList_AddRobotMutationVariables = {
    input: AddRobotInput;
    connections: Array<string>;
};
export type RobotList_AddRobotMutationResponse = {
    readonly addRobot: {
        readonly robot: {
            readonly id: string;
            readonly " $fragmentRefs": FragmentRefs<"RobotListItem_robot">;
        } | null;
    } | null;
};
export type RobotList_AddRobotMutation = {
    readonly response: RobotList_AddRobotMutationResponse;
    readonly variables: RobotList_AddRobotMutationVariables;
};



/*
mutation RobotList_AddRobotMutation(
  $input: AddRobotInput!
) {
  addRobot(input: $input) {
    robot {
      id
      ...RobotListItem_robot
    }
  }
}

fragment RobotListItem_robot on Robot {
  id
  name
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RobotList_AddRobotMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "AddRobotPayload",
        "kind": "LinkedField",
        "name": "addRobot",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Robot",
            "kind": "LinkedField",
            "name": "robot",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RobotListItem_robot"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RobotList_AddRobotMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "AddRobotPayload",
        "kind": "LinkedField",
        "name": "addRobot",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Robot",
            "kind": "LinkedField",
            "name": "robot",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "prependNode",
            "key": "",
            "kind": "LinkedHandle",
            "name": "robot",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              },
              {
                "kind": "Literal",
                "name": "edgeTypeName",
                "value": "RobotEdge"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7d62cfde821be312ff7cc0b704debabf",
    "id": null,
    "metadata": {},
    "name": "RobotList_AddRobotMutation",
    "operationKind": "mutation",
    "text": "mutation RobotList_AddRobotMutation(\n  $input: AddRobotInput!\n) {\n  addRobot(input: $input) {\n    robot {\n      id\n      ...RobotListItem_robot\n    }\n  }\n}\n\nfragment RobotListItem_robot on Robot {\n  id\n  name\n}\n"
  }
};
})();
(node as any).hash = 'ca6d758e1b2ca2619e8e9d0d62c6c852';
export default node;
