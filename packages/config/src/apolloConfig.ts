import { ValidationRule } from 'graphql';
import { loadDefaultValidationRules } from './dependencies/apollo';
import { apolloConfigClientSchemaPath } from './clientSchema';
import { validationRules } from './validationRules';

const ignored = [
  'NoUnusedFragmentsRule',
  'NoUnusedVariablesRule',
  'KnownArgumentNamesRule',
  'NoUndefinedVariablesRule',
];

export const generateValidationRulesForApolloConfig = (): ValidationRule[] => {
  const defaultValidationRules = loadDefaultValidationRules();
  return [
    ...defaultValidationRules.filter((f) => !ignored.includes(f.name)),
    ...validationRules,
  ] as unknown[] as ValidationRule[];
};

export const generateApolloConfig = () => {
  return {
    client: {
      includes: ['src/**/*.{ts,tsx,js,jsx,graphql,gql}', apolloConfigClientSchemaPath],
      validationRules: generateValidationRulesForApolloConfig(),
    },
  };
};
