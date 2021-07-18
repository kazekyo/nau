import { decode } from 'js-base64';

export type CacheIdGenerator = (globalId: string) => string;

const ERROR_MESSAGE = `Cannot convert global id to apollo's cache id.
We only support the following global id: \`typename:id\` or \`typename|id\` format string encoded in Base64.
You should set custom cacheIdGenerator in cacheUpdater parameter.`;

export const defaultCacheIdGenerator = (globalId: string): string => {
  const globalIdStr = decode(globalId);
  let splitStr: string | undefined;
  if (globalIdStr.includes(':')) {
    // e.g. graphql-relay-js
    splitStr = ':';
  } else if (globalIdStr.includes('|')) {
    // e.g. graphql-ruby
    splitStr = '|';
  }
  if (!splitStr) throw Error(ERROR_MESSAGE);

  const array = globalIdStr.split(splitStr);
  if (array.length !== 2) throw Error(ERROR_MESSAGE);

  const typename = array[0];
  return `${typename}:${globalId}`;
};
