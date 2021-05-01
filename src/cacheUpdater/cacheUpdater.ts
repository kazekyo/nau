import { FieldFunctionOptions, Reference, TypePolicy } from '@apollo/client';
import { CacheIdGenerator, defaultCacheIdGenerator } from './cacheIdGenerator';
import { deleteRecordFromChildrenField } from './deleteRecord';
import { insertNodesToConnections } from './insertNode';

export type CacheUpdaterOptions = {
  cacheIdGenerator: CacheIdGenerator;
};

export const cacheUpdater = (
  { cacheIdGenerator }: CacheUpdaterOptions = { cacheIdGenerator: defaultCacheIdGenerator },
): TypePolicy => {
  return {
    merge(
      existing: Reference,
      incoming: Reference,
      { cache, field, storeFieldName, readField, mergeObjects }: FieldFunctionOptions,
    ) {
      const mergedObject = mergeObjects(existing, incoming);

      deleteRecordFromChildrenField({
        object: mergedObject,
        cacheIdGenerator: cacheIdGenerator,
        cache,
        field,
        readField,
      });

      insertNodesToConnections({
        object: mergedObject,
        cacheIdGenerator,
        cache,
        field,
        storeFieldName,
      });

      return mergedObject;
    },
  };
};
