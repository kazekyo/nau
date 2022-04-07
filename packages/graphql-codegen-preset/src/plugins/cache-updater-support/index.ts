import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import {
  concatAST,
  DocumentNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { extname } from 'path';
import { nonNullable } from '../../utils/nonNullable';
import { PaginationPluginConfig, PaginationRawPluginConfig } from './config';
import { PaginationVisitor } from './visitor';

export const plugin: PluginFunction<
  PaginationRawPluginConfig & { documentFiles: Types.DocumentFile[] },
  Types.ComplexPluginOutput
> = (schema, _, config) => {
  const { documentFiles } = config;
  const documents = documentFiles.map((file) => file.document).filter(nonNullable);
  const allAst = concatAST(documents);

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter((d) => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
      (fragmentDef) => ({
        node: fragmentDef,
        name: fragmentDef.name.value,
        onType: fragmentDef.typeCondition.name.value,
        isExternal: false,
      }),
    ),
    ...(config.externalFragments || []),
  ];
  const typeInfo = new TypeInfo(schema);
  const visitor = new PaginationVisitor(schema, allFragments, config, documentFiles, typeInfo);
  visit(allAst, visitWithTypeInfo(typeInfo, { leave: visitor })) as DocumentNode;

  return {
    content: [visitor.getPaginationMetaListContent()].join('\n'),
  };
};

export const validate: PluginValidateFn = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: PaginationPluginConfig,
  outputFile: string,
) => {
  if (extname(outputFile) !== '.tsx' && extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "nau.cacheUpdaterSupport" requires extension to be ".tsx" or ".ts"!`);
  }
};
