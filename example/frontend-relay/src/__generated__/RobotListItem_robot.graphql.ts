/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type RobotListItem_robot = {
    readonly id: string;
    readonly name: string | null;
    readonly " $refType": "RobotListItem_robot";
};
export type RobotListItem_robot$data = RobotListItem_robot;
export type RobotListItem_robot$key = {
    readonly " $data"?: RobotListItem_robot$data;
    readonly " $fragmentRefs": FragmentRefs<"RobotListItem_robot">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RobotListItem_robot",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Robot",
  "abstractKey": null
};
(node as any).hash = '1fc76471d1f0ce24d4c3481f4e9caf29';
export default node;
