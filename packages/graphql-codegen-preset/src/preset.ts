import { Types } from '@graphql-codegen/plugin-helpers';
import { checkValidationErrors, validateGraphQlDocuments } from '@graphql-tools/utils';
import {
  RelayArgumentsOfCorrectType,
  RelayDefaultValueOfCorrectType,
  RelayKnownArgumentNames,
  RelayNoUnusedArguments,
} from '@relay-graphql-js/validation-rules';
import {
  ASTVisitor,
  buildASTSchema,
  extendSchema,
  GraphQLSchema,
  parse,
  specifiedRules,
  ValidationContext,
  ValidationRule,
} from 'graphql';
import cloneDeep from 'lodash.clonedeep';
import * as paginationPlugin from './plugins/cache-updater-support';
import { PresetConfig } from './presetConfig';
import { transform as addPaginationFields } from './transforms/addPaginationFields';
import { transform as fixVariableNotDefinedInRoot } from './transforms/fixVariableNotDefinedInRoot';
import { transform as generateRefetchQuery } from './transforms/generateRefetchQuery';
import { transform as passArgumentValueToFragment } from './transforms/passArgumentValueToFragment';
import { transform as removeCustomDirective } from './transforms/removeCustomDirective';
import { customDirectives } from './utils/directive';
import { paginationDirectiveValidationRule } from './validationRules/PaginationDirective';

const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  let result = { documentFiles };
  [passArgumentValueToFragment, generateRefetchQuery, fixVariableNotDefinedInRoot, addPaginationFields].forEach(
    (transformFunc) => {
      result = transformFunc(result);
    },
  );
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

const addCustomClientDirective = (graphGLSchema: GraphQLSchema): GraphQLSchema => {
  const currentDirectives = graphGLSchema.getDirectives();
  const additionalDirectives = Object.entries(customDirectives)
    .filter(([key, _]) => !currentDirectives.find((d) => d.name === key))
    .map(([_, value]) => value);

  if (additionalDirectives.length === 0) {
    return graphGLSchema;
  }

  return extendSchema(graphGLSchema, parse(additionalDirectives.join('\n')));
};

export const preset: Types.OutputPreset<PresetConfig> = {
  buildGeneratesSection: (options) => {
    const originalGraphQLSchema: GraphQLSchema = options.schemaAst
      ? options.schemaAst
      : buildASTSchema(options.schema, options.config);
    const schemaObject = addCustomClientDirective(originalGraphQLSchema);

    return validateGraphQlDocuments(schemaObject, options.documents, validationRules()).then((errors) => {
      checkValidationErrors(errors);

      const transformedObject = transform({ documentFiles: options.documents });

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

      // const documentFiles = transformedObject.documentFiles;
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
