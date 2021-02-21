/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type RemoveRobotInput = {
    robotId: string;
    userId: string;
    clientMutationId?: string | null;
};
export type RemoveRobotMutationVariables = {
    input: RemoveRobotInput;
};
export type RemoveRobotMutationResponse = {
    readonly removeRobot: {
        readonly robot: {
            readonly id: string;
        } | null;
    } | null;
};
export type RemoveRobotMutation = {
    readonly response: RemoveRobotMutationResponse;
    readonly variables: RemoveRobotMutationVariables;
};



/*
mutation RemoveRobotMutation(
  $input: RemoveRobotInput!
) {
  removeRobot(input: $input) {
    robot {
      id
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RemoveRobotMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveRobotPayload",
        "kind": "LinkedField",
        "name": "removeRobot",
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
              (v2/*: any*/)
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RemoveRobotMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveRobotPayload",
        "kind": "LinkedField",
        "name": "removeRobot",
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
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "deleteRecord",
                "key": "",
                "kind": "ScalarHandle",
                "name": "id"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "efc071922aa451d35dc0bb0b7e97fcad",
    "id": null,
    "metadata": {},
    "name": "RemoveRobotMutation",
    "operationKind": "mutation",
    "text": "mutation RemoveRobotMutation(\n  $input: RemoveRobotInput!\n) {\n  removeRobot(input: $input) {\n    robot {\n      id\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '242249d5ee3c783ff9903654830aba01';
export default node;
