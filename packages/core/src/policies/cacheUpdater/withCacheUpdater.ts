import { TypePolicies } from '@apollo/client';
import { uniqWith } from 'lodash';
import { DeleteRecordMeta, generateDeleteRecordTypePolicyPairs } from './deleteRecord';
import {
  generatePaginationNodeTypePolicyPairs,
  generatePaginationParentTypePolicyPairs,
  PaginationMeta,
} from './pagination';
import { TypePolicyPair } from './util';

const mergeTypePolicyPairs = (pairsList: Array<TypePolicyPair[]>): TypePolicyPair[] => {
  const allTypename = uniqWith(
    pairsList.flat().map(([key, _]) => key),
    (a, b) => a === b,
  );
  return allTypename.map((typename) => {
    const pairs = pairsList.flat().filter((pair) => pair[0] === typename);
    let newTypePolicy = {};
    pairs.forEach((pair) => {
      newTypePolicy = { ...newTypePolicy, ...pair[1] };
    });
    return [typename, newTypePolicy];
  });
};

const typePoliciesFromTypePolicyPairs = (typePolicyPairs: TypePolicyPair[]): TypePolicies => {
  return Object.fromEntries(typePolicyPairs);
};

// NOTE: If you want to remove an edge from an edges of a connection when using @deleteRecord,
//   you must set the information of that connection to `paginationMetaList`.
//   This means that the connection requires the @pagination directive.
export const withCacheUpdaterInternal = ({
  paginationMetaList,
  deleteRecordMetaList,
  typePolicies,
}: {
  paginationMetaList: PaginationMeta[];
  deleteRecordMetaList: DeleteRecordMeta[];
  typePolicies: TypePolicies;
}): TypePolicies => {
  const paginationParentTypePolicyPairs = generatePaginationParentTypePolicyPairs({ paginationMetaList, typePolicies });
  const paginationNodeTypePolicyPairs = generatePaginationNodeTypePolicyPairs({ paginationMetaList, typePolicies });
  const paginationTypePolicyPairs = mergeTypePolicyPairs([
    paginationParentTypePolicyPairs,
    paginationNodeTypePolicyPairs,
  ]);

  let newTypePolicies = {
    ...typePolicies,
    ...typePoliciesFromTypePolicyPairs(paginationTypePolicyPairs),
  };

  const deleteRecordTypePolicyPairs = generateDeleteRecordTypePolicyPairs({
    deleteRecordMetaList,
    typePolicies: newTypePolicies,
  });

  newTypePolicies = { ...newTypePolicies, ...typePoliciesFromTypePolicyPairs(deleteRecordTypePolicyPairs) };

  return newTypePolicies;
};
