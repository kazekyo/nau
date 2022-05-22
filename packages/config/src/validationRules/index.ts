import { defaultValidationRules } from 'apollo-language-server/lib/errors/validation';
import {
  RelayArgumentsOfCorrectType,
  RelayDefaultValueOfCorrectType,
  RelayKnownArgumentNames,
  RelayNoUnusedArguments,
} from '@relay-graphql-js/validation-rules';
import { paginationDirectiveValidationRule } from './paginationDirective';
import { ValidationRule } from 'graphql';

const ignored = [
  'NoUnusedFragmentsRule',
  'NoUnusedVariablesRule',
  'KnownArgumentNamesRule',
  'NoUndefinedVariablesRule',
];
const rules = defaultValidationRules.filter((f) => !ignored.includes(f.name));

export const validationRules: ValidationRule[] = [
  ...rules,
  RelayArgumentsOfCorrectType,
  RelayDefaultValueOfCorrectType,
  RelayNoUnusedArguments,
  RelayKnownArgumentNames,
  paginationDirectiveValidationRule,
] as unknown[] as ValidationRule[];
