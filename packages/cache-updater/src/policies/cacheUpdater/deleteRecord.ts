import { FieldFunctionOptions, Reference, TypePolicies, TypePolicy } from '@apollo/client';
import { FieldNode } from 'graphql';
import { findDirectiveName } from '../../utils/directiveName';
import { generateTypePolicyPairWithTypeMergeFunction, TypePolicyPair } from './util';

export type DeleteRecordMeta = {
  parent: {
    typename: string;
  };
  fields: { fieldName: string; typename: string }[];
};

export const generateDeleteRecordTypePolicyPairs = ({
  deleteRecordMetaList,
  typePolicies,
}: {
  deleteRecordMetaList: DeleteRecordMeta[];
  typePolicies: TypePolicies;
}): [string, TypePolicy][] => {
  return deleteRecordMetaList.map((metadata): TypePolicyPair => {
    return generateTypePolicyPairWithTypeMergeFunction({
      innerFunction: ({ mergedObject, options }) => deleteRecord({ object: mergedObject, options, metadata }),
      typename: metadata.parent.typename,
      typePolicies,
    });
  });
};

const deleteRecord = ({
  object,
  options,
  metadata,
}: {
  object: Reference;
  options: FieldFunctionOptions;
  metadata: DeleteRecordMeta;
}): void => {
  const { cache, field, readField } = options;

  const fieldsWithDeleteRecord =
    field?.selectionSet?.selections
      .filter(
        (selection): selection is FieldNode =>
          !!findDirectiveName({ fieldOrSelection: selection, directiveNames: ['deleteRecord'] }) &&
          selection.kind === 'Field',
      )
      .map((selection) => selection.name.value) || [];

  if (fieldsWithDeleteRecord.length === 0) return;

  metadata.fields.forEach((fieldMeta) => {
    if (!fieldsWithDeleteRecord.includes(fieldMeta.fieldName)) return;
    const id = readField({ fieldName: fieldMeta.fieldName, from: object });
    if (typeof id != 'string') return;
    const cacheId = cache.identify({ id, __typename: fieldMeta.typename });
    cache.evict({ id: cacheId });
  });

  cache.gc();
};
