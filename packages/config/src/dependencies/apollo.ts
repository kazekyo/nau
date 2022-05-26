import * as _GraphQL from 'graphql';

const mod = require.main || module;
const isJest = typeof jest !== 'undefined';

// NOTE: By not loading dependencies until this function is called,
//   we can use this library in extensions without './errors/validation'
export const loadDefaultValidationRules = () => {
  const { defaultValidationRules } = mod.require(
    isJest ? 'apollo-language-server/lib/errors/validation' : './errors/validation',
  ) as { defaultValidationRules: _GraphQL.ValidationRule[] };
  return defaultValidationRules;
};
