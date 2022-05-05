import { Types } from '@graphql-codegen/plugin-helpers';
import { checkValidationErrors, validateGraphQlDocuments } from '@graphql-tools/utils';
import {
  RelayArgumentsOfCorrectType,
  RelayDefaultValueOfCorrectType,
  RelayKnownArgumentNames,
  RelayNoUnusedArguments,
} from '@relay-graphql-js/validation-rules';
import { ASTVisitor, buildASTSchema, GraphQLSchema, specifiedRules, ValidationContext, ValidationRule } from 'graphql';
import cloneDeep from 'lodash.clonedeep';
import * as paginationPlugin from './plugins/cache-updater-support';
import { PresetConfig } from './presetConfig';
import { addCustomClientDirective } from './schemaTransforms/addClientDirective';
import { addConnectionId } from './schemaTransforms/addConnectionId';
import { transform as addFieldsForAddingNode } from './transforms/addFieldsForAddingNode';
import { transform as addPaginationFields } from './transforms/addPaginationFields';
import { transform as fixVariableNotDefinedInRoot } from './transforms/fixVariableNotDefinedInRoot';
import { transform as generateRefetchQuery } from './transforms/generateRefetchQuery';
import { transform as passArgumentValueToFragment } from './transforms/passArgumentValueToFragment';
import { transform as removeCustomDirective } from './transforms/removeCustomDirective';
import { paginationDirectiveValidationRule } from './validationRules/paginationDirective';

const transformDocuments = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  let result = { documentFiles };
  [
    passArgumentValueToFragment,
    generateRefetchQuery,
    fixVariableNotDefinedInRoot,
    addPaginationFields,
    addFieldsForAddingNode,
  ].forEach((transformFunc) => {
    result = transformFunc(result);
  });
  return result;
};

const transformSchema = (schema: GraphQLSchema, documentFiles: Types.DocumentFile[]): GraphQLSchema => {
  let result = schema;
  [addCustomClientDirective, addConnectionId].forEach((transform) => {
    result = transform(result, documentFiles).schema;
  });
  return result;
};

const validationRules = (): ValidationRule[] => {
  const ignored = [
    'NoUnusedFragmentsRule',
    'NoUnusedVariablesRule',
    'KnownArgumentNamesRule',
    'NoUndefinedVariablesRule',
  ];
  const v4ignored = ignored.map((rule) => rule.replace(/Rule$/, ''));

  const rules = specifiedRules.filter(
    (f: (context: ValidationContext) => ASTVisitor) => !ignored.includes(f.name) && !v4ignored.includes(f.name),
  );
  return [
    ...rules,
    RelayArgumentsOfCorrectType,
    RelayDefaultValueOfCorrectType,
    RelayNoUnusedArguments,
    RelayKnownArgumentNames,
    paginationDirectiveValidationRule,
  ];
};

export const preset: Types.OutputPreset<PresetConfig> = {
  buildGeneratesSection: (options) => {
    const originalGraphQLSchema: GraphQLSchema = options.schemaAst
      ? options.schemaAst
      : buildASTSchema(options.schema, options.config);

    const schemaObject = transformSchema(originalGraphQLSchema, options.documents);

    return validateGraphQlDocuments(schemaObject, options.documents, validationRules()).then((errors) => {
      checkValidationErrors(errors);

      const transformedObject = transformDocuments({ documentFiles: options.documents });

      let pluginMap = options.pluginMap;
      let plugins = options.plugins;
      const { generateTypeScriptCode } = options.presetConfig;
      if (generateTypeScriptCode) {
        pluginMap = { [`nau-pagination-code`]: paginationPlugin, ...pluginMap };
        plugins = [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          { [`nau-pagination-code`]: { documentFiles: cloneDeep(transformedObject.documentFiles) } },
          ...plugins,
        ];
      }

      const { documentFiles } = removeCustomDirective({ documentFiles: transformedObject.documentFiles });

      const result = [
        {
          filename: options.baseOutputDir,
          plugins: plugins,
          pluginMap: pluginMap,
          config: options.config,
          schema: options.schema,
          schemaAst: schemaObject,
          documents: documentFiles,
        },
      ];
      return result;
    });
  },
};
