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
import { transform as generateRefetchQuery } from './transforms/generateRefetchQuery';
import { transform as passArgumentValueToFragment } from './transforms/passArgumentValueToFragment';
import { transform as removeCustomDirective } from './transforms/removeCustomDirective';

const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  let result = { documentFiles };
  [passArgumentValueToFragment, generateRefetchQuery, removeCustomDirective].forEach((transformFunc) => {
    result = transformFunc(result);
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
  ];
};

const addCustomClientDirective = (graphGLSchema: GraphQLSchema): GraphQLSchema => {
  const currentDirectives = graphGLSchema.getDirectives();
  const customDirectives = {
    arguments: 'directive @arguments on FRAGMENT_SPREAD',
    argumentDefinitions: 'directive @argumentDefinitions on FRAGMENT_DEFINITION',
    refetchable: 'directive @refetchable(queryName: String) on FRAGMENT_DEFINITION',
  };
  const additionalDirectives = Object.entries(customDirectives)
    .filter(([key, _]) => !currentDirectives.find((d) => d.name === key))
    .map(([_, value]) => value);

  if (additionalDirectives.length === 0) {
    return graphGLSchema;
  }

  return extendSchema(graphGLSchema, parse(additionalDirectives.join('\n')));
};

export const preset: Types.OutputPreset = {
  buildGeneratesSection: (options) => {
    const originalGraphQLSchema: GraphQLSchema = options.schemaAst
      ? options.schemaAst
      : buildASTSchema(options.schema, options.config);
    const schemaObject = addCustomClientDirective(originalGraphQLSchema);

    return validateGraphQlDocuments(schemaObject, options.documents, validationRules()).then((errors) => {
      checkValidationErrors(errors);
      const { documentFiles } = transform({ documentFiles: options.documents });
      const result = [
        {
          filename: options.baseOutputDir,
          plugins: options.plugins,
          pluginMap: options.pluginMap,
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
