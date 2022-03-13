import { FieldFunctionOptions, FieldMergeFunction, Reference, TypePolicies, TypePolicy } from '@apollo/client';

export type TypePolicyPair = [string, TypePolicy];

export const findTypePolicy = ({
  key,
  typePolicies,
}: {
  key: string;
  typePolicies: TypePolicies;
}): TypePolicy | undefined => {
  const keys = Object.keys(typePolicies);
  if (keys.includes(key)) {
    return typePolicies[key];
  }
  return undefined;
};

export const generateTypePolicyPairWithTypeMergeFunction = ({
  innerFunction,
  typename,
  typePolicies,
}: {
  innerFunction: (params: { mergedObject: Reference; incoming: Reference; options: FieldFunctionOptions }) => void;
  typename: string;
  typePolicies: TypePolicies;
}): TypePolicyPair => {
  const originalTypePolicy = findTypePolicy({ key: typename, typePolicies });

  if (!originalTypePolicy) {
    return [
      typename,
      {
        merge: (existing, incoming, options) => {
          const object = options.mergeObjects(existing, incoming);
          innerFunction({ mergedObject: object, incoming, options });
          return object;
        },
      },
    ];
  }

  const typePolicy: TypePolicy = {
    ...originalTypePolicy,
    merge: (existing, incoming, options) => {
      const object = options.mergeObjects(existing, incoming);
      if (object) innerFunction({ mergedObject: object, incoming, options });
      return callMerge({ merge: originalTypePolicy.merge, mergedObject: object, incoming, options });
    },
  };
  return [typename, typePolicy];
};

const callMerge = ({
  merge,
  mergedObject,
  incoming,
  options,
}: {
  merge?: FieldMergeFunction | boolean;
  mergedObject: Reference;
  incoming: Reference;
  options: FieldFunctionOptions;
}): Reference => {
  if (merge === false) {
    return incoming;
  } else if (merge === true || !merge) {
    return mergedObject;
  } else {
    return merge(mergedObject, incoming, options);
  }
};
