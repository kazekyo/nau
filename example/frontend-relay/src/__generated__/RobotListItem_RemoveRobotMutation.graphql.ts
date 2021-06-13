/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type RemoveRobotInput = {
    robotId: string;
    userId: string;
    clientMutationId?: string | null;
};
export type RobotListItem_RemoveRobotMutationVariables = {
    input: RemoveRobotInput;
};
export type RobotListItem_RemoveRobotMutationResponse = {
    readonly removeRobot: {
        readonly robot: {
            readonly id: string;
        };
    } | null;
};
export type RobotListItem_RemoveRobotMutation = {
    readonly response: RobotListItem_RemoveRobotMutationResponse;
    readonly variables: RobotListItem_RemoveRobotMutationVariables;
};



/*
mutation RobotListItem_RemoveRobotMutation(
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
    "name": "RobotListItem_RemoveRobotMutation",
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
    "name": "RobotListItem_RemoveRobotMutation",
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
    "cacheID": "2446452a085193c5d38638a7cd4d7523",
    "id": null,
    "metadata": {},
    "name": "RobotListItem_RemoveRobotMutation",
    "operationKind": "mutation",
    "text": "mutation RobotListItem_RemoveRobotMutation(\n  $input: RemoveRobotInput!\n) {\n  removeRobot(input: $input) {\n    robot {\n      id\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '043e86c6be008865ffa9cb1df141bbfe';
export default node;
