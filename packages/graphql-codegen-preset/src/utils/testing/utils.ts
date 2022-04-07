import { Types } from '@graphql-codegen/plugin-helpers';
import { readFileSync } from 'fs';
import { buildSchema, concatAST, parse, print } from 'graphql';
import path from 'path';
import { nonNullable } from '../nonNullable';

export const printDocuments = (documentFiles: Types.DocumentFile[]): string => {
  const ast = concatAST(documentFiles.map((v) => v.document).filter(nonNullable));
  return print(ast);
};

const filePath = path.join(__dirname, './example.graphql');
const schemaString = readFileSync(filePath, { encoding: 'utf-8' });
export const testGraphqlSchema = buildSchema(schemaString);
export const testSchemaDocumentNode = parse(schemaString);
