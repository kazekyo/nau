import { Types } from '@graphql-codegen/plugin-helpers';
import { ASTNode, DocumentNode, FragmentDefinitionNode, parseType, visit } from 'graphql';
import { ARGUMENT_DEFINITIONS_DIRECTIVE_NAME } from '../utils/directive';
import {
  getFragmentDefinitionByName,
  getFragmentDefinitionsByDocumentFiles,
  getOperationDefinition,
} from '../utils/graphqlAST';

type QueryNamesPair = {
  variableNames: string[];
  fragmentNames: string[];
};

export const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  const queryNamesPairs = getQueryNamesPairs({ documentFiles });
  if (queryNamesPairs.length === 0) return { documentFiles };

  const files = documentFiles.map((file) => {
    if (!file.document) return file;

    file.document = visit(file.document, {
      FragmentDefinition: {
        enter(fragmentDefinition) {
          if (!fragmentDefinition.directives) return;
          const argumentDefinitionsDirective = fragmentDefinition.directives.find(
            (directive) => directive.name.value === ARGUMENT_DEFINITIONS_DIRECTIVE_NAME,
          );
          if (!argumentDefinitionsDirective) return;

          return visit(fragmentDefinition, {
            Argument: {
              enter(argumentNode) {
                // Example: field(item: $arg1)
                const argumentValue = argumentNode.value; // # Example: $arg1
                if (argumentValue.kind !== 'Variable') return;

                const isVariableInRoot = existsVariable({
                  variableName: argumentValue.name.value,
                  fragmentName: fragmentDefinition.name.value,
                  queryNamesPairs,
                });
                if (isVariableInRoot) return;

                // Example: @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 })
                const sameNameArgumentDefinition = argumentDefinitionsDirective.arguments?.find(
                  (argument) => argument.name.value === argumentValue.name.value,
                );
                if (!sameNameArgumentDefinition) return;

                if (!('fields' in sameNameArgumentDefinition.value)) return;

                const defaultValueField = sameNameArgumentDefinition.value.fields.find(
                  (field) => field.name.value === 'defaultValue',
                );
                const defaultValue = defaultValueField?.value; // Example: defaultValue is 10
                if (defaultValue) {
                  return { ...argumentNode, value: defaultValue };
                }

                const typeField = sameNameArgumentDefinition.value.fields.find((field) => field.name.value === 'type'); // Example: typeField is Int
                if (!typeField || typeField.value.kind !== 'StringValue') return;

                const argumentTypeFromArgumentDefinition = parseType(typeField.value.value);
                if (argumentTypeFromArgumentDefinition.kind !== 'NonNullType') {
                  return null;
                }
              },
            },
          }) as DocumentNode;
        },
      },
    }) as DocumentNode;
    return file;
  });

  return { documentFiles: files };
};

const getQueryNamesPairs = ({ documentFiles }: { documentFiles: Types.DocumentFile[] }): QueryNamesPair[] => {
  const fragmentDefinitions = getFragmentDefinitionsByDocumentFiles(documentFiles);
  const namesPairs: QueryNamesPair[] = [];
  documentFiles.map((file) => {
    if (!file.document) return file;
    const operationDefinition = getOperationDefinition(file.document);
    if (!operationDefinition) return;
    if (!operationDefinition.variableDefinitions) return;

    const fragmentNames = getFragmentNames({
      targetDefinition: operationDefinition,
      fragmentDefinitions,
      fragmentNames: [],
    });

    const variableNames = operationDefinition.variableDefinitions.map(
      (variableDefinition) => variableDefinition.variable.name.value,
    );

    namesPairs.push({ variableNames, fragmentNames });
  });
  return namesPairs;
};

const getFragmentNames = <TDefinitionNode extends ASTNode>({
  targetDefinition,
  fragmentDefinitions,
  fragmentNames,
}: {
  targetDefinition: TDefinitionNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  fragmentNames: string[];
}): string[] => {
  visit(targetDefinition, {
    FragmentSpread: {
      enter(node) {
        const nextFragmentName = node.name.value;
        const next = getFragmentDefinitionByName({ fragmentDefinitions, fragmentName: node.name.value });
        if (!next) return;

        fragmentNames.push(nextFragmentName);

        getFragmentNames({
          targetDefinition: next,
          fragmentDefinitions,
          fragmentNames,
        });
      },
    },
  }) as TDefinitionNode;
  return fragmentNames;
};

const existsVariable = ({
  variableName,
  fragmentName,
  queryNamesPairs,
}: {
  variableName: string;
  fragmentName: string;
  queryNamesPairs: QueryNamesPair[];
}) => {
  const queryNamesPair = queryNamesPairs.find((info) => info.fragmentNames.find((name) => name === fragmentName));
  if (!queryNamesPair) return false;

  return !!queryNamesPair.variableNames.find((name) => variableName === name);
};

export const exportedForTesting = {
  getQueryNamesPairs,
};
