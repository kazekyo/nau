/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type RobotListItem_user = {
    readonly id: string;
    readonly " $refType": "RobotListItem_user";
};
export type RobotListItem_user$data = RobotListItem_user;
export type RobotListItem_user$key = {
    readonly " $data"?: RobotListItem_user$data;
    readonly " $fragmentRefs": FragmentRefs<"RobotListItem_user">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RobotListItem_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
(node as any).hash = '3b42d45dfff6cf19b6a910f37d837df6';
export default node;
