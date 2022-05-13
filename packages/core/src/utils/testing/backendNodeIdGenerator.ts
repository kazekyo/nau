import { encode } from 'js-base64';
export const backendNodeIdGenerator = ({ typename, localId }: { typename: string; localId: string }): string =>
  encode(`${typename}|${localId}`);
