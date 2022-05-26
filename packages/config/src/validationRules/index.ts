import {
  RelayArgumentsOfCorrectType,
  RelayDefaultValueOfCorrectType,
  RelayKnownArgumentNames,
  RelayNoUnusedArguments,
} from '@relay-graphql-js/validation-rules';
import { ValidationRule } from 'graphql';
import { paginationDirectiveValidationRule } from './paginationDirective';

export const validationRules: ValidationRule[] = [
  RelayArgumentsOfCorrectType,
  RelayDefaultValueOfCorrectType,
  RelayNoUnusedArguments,
  RelayKnownArgumentNames,
  paginationDirectiveValidationRule,
] as unknown[] as ValidationRule[];
