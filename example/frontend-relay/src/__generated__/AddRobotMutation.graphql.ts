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
export type AddRobotMutationVariables = {
    input: AddRobotInput;
    connections: Array<string>;
    edgeTypeName: string;
};
export type AddRobotMutationResponse = {
    readonly addRobot: {
        readonly robot: {
            readonly id: string;
            readonly " $fragmentRefs": FragmentRefs<"RobotListItem_robot">;
        } | null;
    } | null;
};
export type AddRobotMutation = {
    readonly response: AddRobotMutationResponse;
    readonly variables: AddRobotMutationVariables;
};



/*
mutation AddRobotMutation(
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
  "name": "edgeTypeName"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v3 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v4 = {
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
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AddRobotMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
              (v4/*: any*/),
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
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "AddRobotMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
              (v4/*: any*/),
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
                "kind": "Variable",
                "name": "edgeTypeName",
                "variableName": "edgeTypeName"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "86e8a4307fd70def7bfb91568aaf4ae2",
    "id": null,
    "metadata": {},
    "name": "AddRobotMutation",
    "operationKind": "mutation",
    "text": "mutation AddRobotMutation(\n  $input: AddRobotInput!\n) {\n  addRobot(input: $input) {\n    robot {\n      id\n      ...RobotListItem_robot\n    }\n  }\n}\n\nfragment RobotListItem_robot on Robot {\n  id\n  name\n}\n"
  }
};
})();
(node as any).hash = 'a2cca70240079ee8a51ffc04ccc75c13';
export default node;
