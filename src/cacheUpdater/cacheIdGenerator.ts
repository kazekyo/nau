import { decode } from 'js-base64';

export type CacheIdGenerator = (globalId: string) => string | undefined;
export const defaultCacheIdGenerator = (globalId: string): string | undefined => {
  let typename: string | undefined = undefined;
  const globalIdStr = decode(globalId);
  if (globalIdStr.includes(':')) {
    // graphql-relay-js
    typename = globalIdStr.split(':')[0];
  } else if (globalIdStr.includes('|')) {
    // graphql-ruby
    typename = globalIdStr.split('|')[0];
  }

  if (!typename) return undefined;
  return `${typename}:${globalId}`;
};
