import { Types } from '@graphql-codegen/plugin-helpers';
import { concatAST, print } from 'graphql';
import { nonNullable } from '../nonNullable';

export const printDocuments = (documentFiles: Types.DocumentFile[]): string => {
  const ast = concatAST(documentFiles.map((v) => v.document).filter(nonNullable));
  return print(ast);
};
