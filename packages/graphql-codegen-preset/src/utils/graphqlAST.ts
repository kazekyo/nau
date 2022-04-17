import { Types } from '@graphql-codegen/plugin-helpers';
import { DocumentNode, FragmentDefinitionNode, Kind, OperationDefinitionNode } from 'graphql';
import { nonNullable } from './nonNullable';

export function getOperationDefinition(doc: DocumentNode): OperationDefinitionNode | undefined {
  return doc.definitions.filter(
    (definition) => definition.kind === 'OperationDefinition',
  )[0] as OperationDefinitionNode;
}

export function getOperationDefinitions(doc: DocumentNode): OperationDefinitionNode[] {
  return doc.definitions.filter((definition) => definition.kind === 'OperationDefinition') as OperationDefinitionNode[];
}

export const getFragmentDefinitions = (documentNode: DocumentNode): FragmentDefinitionNode[] => {
  return documentNode.definitions.filter(
    (definition): definition is FragmentDefinitionNode => definition.kind === 'FragmentDefinition',
  );
};

export const getFragmentDefinitionsByDocumentFiles = (
  documentFiles: Types.DocumentFile[],
): FragmentDefinitionNode[] => {
  return documentFiles
    .map((file) => file.document?.definitions)
    .filter(nonNullable)
    .flat()
    .filter((definition): definition is FragmentDefinitionNode => definition.kind === Kind.FRAGMENT_DEFINITION);
};

export const getFragmentDefinitionByName = ({
  fragmentDefinitions,
  fragmentName,
}: {
  fragmentDefinitions: FragmentDefinitionNode[];
  fragmentName: string;
}): FragmentDefinitionNode | undefined => {
  return fragmentDefinitions.find((definition) => definition.name.value === fragmentName);
};
