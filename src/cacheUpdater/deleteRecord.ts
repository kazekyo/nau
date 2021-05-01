import { FieldFunctionOptions, Reference } from '@apollo/client';
import { FieldNode } from 'graphql/language';
import { CacheIdGenerator } from './cacheIdGenerator';
import { findDirectiveName } from './directiveName';

export const deleteRecordFromChildrenField = ({
  object,
  cacheIdGenerator,
  cache,
  field,
  readField,
}: {
  object: Reference;
  cacheIdGenerator: CacheIdGenerator;
} & Pick<FieldFunctionOptions, 'cache' | 'field' | 'readField'>): void => {
  const fieldNames =
    field?.selectionSet?.selections
      .filter(
        (selection): selection is FieldNode =>
          !!findDirectiveName({ fieldOrSelection: selection, directiveNames: ['deleteRecord'] }) &&
          selection.kind === 'Field',
      )
      .map((selection) => selection.name.value) || [];
  fieldNames.forEach((fieldName) => {
    const globalId = readField({ fieldName, from: object });
    if (typeof globalId != 'string') return;
    const cacheId = cacheIdGenerator(globalId);
    cache.evict({ id: cacheId });
  });
  if (fieldNames.length > 0) {
    cache.gc();
  }
};
