import * as _GraphQL from 'graphql';

const mod = require.main || module;
const isJest = typeof jest !== 'undefined';

// NOTE: By not loading dependencies until this function is called,
//   we can use this library in extensions without './errors/validation'
export const loadDefaultValidationRules = () => {
  let validationRules: _GraphQL.ValidationRule[] = [];
  if (!isJest) {
    const { defaultValidationRules } = mod.require('./errors/validation') as {
      defaultValidationRules: _GraphQL.ValidationRule[];
    };
    validationRules = defaultValidationRules;
  }
  return validationRules;
};
