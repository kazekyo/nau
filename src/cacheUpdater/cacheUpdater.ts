import { FieldFunctionOptions, FieldMergeFunction, Reference, TypePolicies, TypePolicy } from '@apollo/client';
import { CacheIdGenerator, defaultCacheIdGenerator } from './cacheIdGenerator';
import { deleteRecordFromChildrenField } from './deleteRecord';
import { insertNodesToConnections } from './insertNode';

export type CacheUpdaterOptions = {
  cacheIdGenerator: CacheIdGenerator;
};

export const withCacheUpdater = ({
  directiveAvailableTypes,
  typePolicies: existingTypePolicies,
}: {
  directiveAvailableTypes: string[];
  typePolicies: TypePolicies;
}): TypePolicies => {
  const existingTypePolicyKeys = Object.keys(existingTypePolicies);

  const typePolicyArray = directiveAvailableTypes.map((type): [string, TypePolicy] => {
    let typePolicy: TypePolicy = cacheUpdater();
    if (existingTypePolicyKeys.includes(type)) {
      const existingTypePolicy = existingTypePolicies[type];
      const cacheUpdaterMergeFunction = cacheUpdater().merge as FieldMergeFunction<Reference, Reference>;
      const mergeFunction: FieldMergeFunction<Reference, Reference> = (existing, incoming, options, ...rest) => {
        cacheUpdaterMergeFunction(existing, incoming, options, ...rest);
        if (existingTypePolicy.merge === false || !existing) {
          return incoming;
        } else if (existingTypePolicy.merge === true || !existingTypePolicy.merge) {
          return options.mergeObjects(existing, incoming);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return existingTypePolicy.merge(existing, incoming, options, ...rest);
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
    merge(existing: Reference, incoming: Reference, options: FieldFunctionOptions) {
      const mergedObject = options.mergeObjects(existing, incoming);

      deleteRecordFromChildrenField({
        object: mergedObject,
        cacheIdGenerator: cacheIdGenerator,
        ...options,
      });

      insertNodesToConnections({
        object: mergedObject,
        cacheIdGenerator,
        ...options,
      });

      return mergedObject;
    },
  };
};
