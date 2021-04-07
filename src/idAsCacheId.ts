import { StoreObject } from '@apollo/client';

export type TypePolicies = { [key: string]: { [key: string]: unknown } };
export const idAsCacheId = (
  typePolicies: TypePolicies,
  options?: { idFieldName?: string; excludes?: string[] },
): TypePolicies =>
  Object.fromEntries(
    Object.entries(typePolicies).map(([typeName, object]) => {
      const excludes = options?.excludes || [];
      const newObject = excludes.includes(typeName)
        ? object
        : {
            ...object,
            keyFields: (obj: Readonly<StoreObject>): string => {
              if (options?.idFieldName) {
                return obj[options.idFieldName] as string;
              } else {
                return obj.id as string;
              }
            },
          };
      return [typeName, newObject];
    }),
  );