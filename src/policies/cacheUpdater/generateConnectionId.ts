import { encode } from 'js-base64';

export type ConnectionInfo = {
  id?: string;
  field: string;
  args?: Record<string, unknown>;
};

export const generateConnectionId = (connectionInfo: ConnectionInfo): string => encode(JSON.stringify(connectionInfo));
