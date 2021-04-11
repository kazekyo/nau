export declare type TypePolicies = {
    [key: string]: {
        [key: string]: unknown;
    };
};
export declare const setIdAsCacheKey: (typePolicies: TypePolicies, options?: {
    idFieldName?: string | undefined;
    excludes?: string[] | undefined;
} | undefined) => TypePolicies;
