import { FieldFunctionOptions, FieldMergeFunction, Reference, TypePolicies, TypePolicy } from '@apollo/client';
import { CacheIdGenerator, defaultCacheIdGenerator } from './cacheIdGenerator';
import { deleteRecordFromChildrenField } from './deleteRecord';
import { insertNodesToConnections } from './insertNode';

export type CacheUpdaterOptions = {
  cacheIdGenerator: CacheIdGenerator;
};

export const withCacheUpdater = ({
  targetTypes,
  typePolicies: existingTypePolicies,
}: {
  targetTypes: string[];
  typePolicies: TypePolicies;
}): TypePolicies => {
  const existingTypePolicyKeys = Object.keys(existingTypePolicies);

  const typePolicyArray = targetTypes.map((type): [string, TypePolicy] => {
    let typePolicy: TypePolicy = cacheUpdater();
    if (existingTypePolicyKeys.includes(type)) {
      const existingTypePolicy = existingTypePolicies[type];
      const cacheUpdaterMergeFunction = cacheUpdater().merge as FieldMergeFunction<Reference, Reference>;
      const mergeFunction: FieldMergeFunction<Reference, Reference> = (existing, incoming, options, ...other) => {
        cacheUpdaterMergeFunction(existing, incoming, options, ...other);
        if (existingTypePolicy.merge === false || !existing) {
          return incoming;
        } else if (existingTypePolicy.merge === true || !existingTypePolicy.merge) {
          return options.mergeObjects(existing, incoming);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return existingTypePolicy.merge(existing, incoming, options, ...other);
        }
      };
      typePolicy = {
        ...existingTypePolicy,
        merge: mergeFunction,
      };
    }
    return [type, typePolicy];
  });
  const result = { ...existingTypePolicies, ...Object.fromEntries(typePolicyArray) };
  return result;
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
