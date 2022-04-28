import { Types } from '@graphql-codegen/plugin-helpers';
import { ARGUMENT_DEFINITIONS_DIRECTIVE_NAME } from '@nau/core';
import {
  ASTNode,
  DocumentNode,
  FragmentDefinitionNode,
  Kind,
  NullValueNode,
  OperationDefinitionNode,
  visit,
} from 'graphql';
import {
  getFragmentDefinitionByName,
  getFragmentDefinitionsByDocumentFiles,
  getOperationDefinitions,
} from '../utils/graphqlAST';
import {
  ArgumentDefinitionData,
  FRAGMENT_NAME_INFO_ID_3,
  getArgumentDefinitionDataList,
  getUniqueFragmentName,
} from './util';

type OperationInfo = {
  operationName?: string;
  variableNames: string[];
  belongsFragmentNames: string[];
};

export const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  const fragmentDefinitions = getFragmentDefinitionsByDocumentFiles(documentFiles);

  let operationInfoList = getOperationInfoList({ documentFiles });

  let files = documentFiles.map((file) => {
    if (!file.document) return file;
    const result = copyFragments({
      documentNode: file.document,
      fragmentDefinitions,
      operationInfoList,
    });
    file.document = result.documentNode;
    return file;
  });

  operationInfoList = getOperationInfoList({ documentFiles: files });
  if (operationInfoList.length === 0) return { documentFiles: files };

  files = documentFiles.map((file) => {
    if (!file.document) return file;
    file.document = fixVariables({ documentNode: file.document, operationInfoList });
    return file;
  });
  return { documentFiles: files };
};

// Copy fragment definitions if both operations are with and without a argument in operation variables
const copyFragments = (params: {
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  operationInfoList: OperationInfo[];
}): { documentNode: DocumentNode } => {
  const { fragmentDefinitions, operationInfoList } = params;
  let documentNode = params.documentNode;
  const operationDefinitions = getOperationDefinitions(documentNode);
  if (!operationDefinitions) return { documentNode };

  const changedOperationDefinitions: OperationDefinitionNode[] = [];
  operationDefinitions.forEach((operationDefinition) => {
    const transformResult = transformFragmentSpreadFields({
      targetDefinition: operationDefinition,
      operationDefinition,
      documentNode: documentNode,
      fragmentDefinitions,
      operationInfoList,
    });
    changedOperationDefinitions.push(transformResult.newDefinition);
    documentNode = transformResult.documentNode;
  });

  return {
    documentNode: {
      ...documentNode,
      definitions: [
        ...changedOperationDefinitions,
        ...documentNode.definitions.filter((definition) => definition.kind !== 'OperationDefinition'),
      ],
    },
  };
};

const transformFragmentSpreadFields = <
  TDefinitionNode extends OperationDefinitionNode | FragmentDefinitionNode,
>(params: {
  targetDefinition: TDefinitionNode;
  operationDefinition: OperationDefinitionNode;
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  operationInfoList: OperationInfo[];
}): {
  documentNode: DocumentNode;
  newDefinition: TDefinitionNode;
  changed?: { fragmentName: string };
} => {
  const { targetDefinition, fragmentDefinitions, operationInfoList, operationDefinition } = params;
  let documentNode = params.documentNode;
  const tokens: string[] = [];
  const currentDefinition = visit(targetDefinition, {
    FragmentSpread: {
      leave(originalNode) {
        const originalFragmentName = originalNode.name.value;
        const nextTargetFragmentDefinition = getFragmentDefinitionByName({
          fragmentDefinitions,
          fragmentName: originalFragmentName,
        });
        if (!nextTargetFragmentDefinition) return;

        const result = transformFragmentDefinition({
          targetFragmentDefinition: nextTargetFragmentDefinition,
          documentNode: documentNode,
          operationDefinition: params.operationDefinition,
          fragmentDefinitions,
          operationInfoList,
        });
        documentNode = result.documentNode;
        if (!result.changed) return;

        const changedSpareadFragmentFieldNode = {
          ...originalNode,
          name: { ...originalNode.name, value: result.changed.fragmentName },
        };

        if (targetDefinition.kind === Kind.OPERATION_DEFINITION) {
          return changedSpareadFragmentFieldNode;
        }

        const isFragmentInOtherOperation = operationInfoList.find(
          (info) =>
            info.operationName !== operationDefinition.name?.value &&
            info.belongsFragmentNames.find((fragmentName) => fragmentName === targetDefinition.name.value),
        );
        if (isFragmentInOtherOperation) {
          const splitName = result.changed.fragmentName.split('_');
          tokens.push(`child:${splitName[splitName.length - 1]}`);
        }

        return changedSpareadFragmentFieldNode;
      },
    },
  }) as TDefinitionNode;

  if (tokens.length !== 0 && currentDefinition.kind === Kind.FRAGMENT_DEFINITION) {
    const uniqueName = getUniqueFragmentName(currentDefinition.name.value, tokens.join(','));
    const newDefinition: FragmentDefinitionNode = {
      ...currentDefinition,
      name: { ...currentDefinition.name, value: uniqueName },
    } as FragmentDefinitionNode;

    const exists = !!documentNode.definitions.find(
      (definition) => definition.kind === Kind.FRAGMENT_DEFINITION && definition.name.value === uniqueName,
    );
    if (!exists) {
      documentNode = {
        ...documentNode,
        definitions: [...documentNode.definitions, newDefinition],
      };
    }
    return {
      documentNode,
      newDefinition: newDefinition as TDefinitionNode,
      changed: { fragmentName: uniqueName },
    };
  }

  return { documentNode, newDefinition: currentDefinition };
};

const transformFragmentDefinition = (params: {
  targetFragmentDefinition: FragmentDefinitionNode;
  operationDefinition: OperationDefinitionNode;
  documentNode: DocumentNode;
  fragmentDefinitions: FragmentDefinitionNode[];
  operationInfoList: OperationInfo[];
}): {
  documentNode: DocumentNode;
  changed?: { fragmentName: string };
} => {
  const { operationInfoList, operationDefinition } = params;

  let documentNode = params.documentNode;
  let currentFragmentDefinition = params.targetFragmentDefinition;
  const transformResult = transformFragmentSpreadFields({
    targetDefinition: currentFragmentDefinition,
    operationDefinition,
    documentNode: documentNode,
    fragmentDefinitions: params.fragmentDefinitions,
    operationInfoList,
  });
  documentNode = transformResult.documentNode;
  currentFragmentDefinition = transformResult.newDefinition;

  let argumentDefinitionDataList: ArgumentDefinitionData[] = [];
  visit(currentFragmentDefinition, {
    Directive: {
      leave(node) {
        if (node.name.value !== ARGUMENT_DEFINITIONS_DIRECTIVE_NAME) return;
        argumentDefinitionDataList = getArgumentDefinitionDataList(node);
        return;
      },
    },
  });

  const variableNames: string[] = [];

  visit(currentFragmentDefinition, {
    Variable: {
      leave(node) {
        const variableName = node.name.value;
        const argumentDefinitionData = argumentDefinitionDataList.find((data) => data.name.value === variableName);
        if (!argumentDefinitionData) return;

        const variableDefinitions = operationDefinition.variableDefinitions;
        if (!variableDefinitions) return;
        const existsInOperationVariable = !!variableDefinitions.find(
          (variableDefinition) => variableDefinition.variable.name.value === variableName,
        );
        if (!existsInOperationVariable) return;

        // If there is a operation that uses the same fragment definition but variable does not exist,
        //   it is subject to copying because it is a different definition of fragment.
        const compare = (info: OperationInfo, fragmentName: string) =>
          info.belongsFragmentNames.find((name) => name === fragmentName) &&
          info.variableNames.find((name) => name === variableName);
        const operationInfoListWithNotIncludingVariable = operationInfoList.filter(
          (info) => !compare(info, currentFragmentDefinition.name.value),
        );
        if (operationInfoListWithNotIncludingVariable.length === 0) return;

        variableNames.push(variableName);

        return false;
      },
    },
  });

  if (variableNames.length === 0) return { documentNode, changed: transformResult.changed };

  // const originalFragmentName = currentFragmentDefinition.name.value;
  const uniqueFragmentName = getUniqueFragmentName(
    currentFragmentDefinition.name.value,
    `${FRAGMENT_NAME_INFO_ID_3},${variableNames.join(',')}`,
  );
  const copiedFragmentDefinition: FragmentDefinitionNode = {
    ...currentFragmentDefinition,
    name: { ...currentFragmentDefinition.name, value: uniqueFragmentName },
  };
  documentNode = {
    ...documentNode,
    definitions: [...documentNode.definitions, copiedFragmentDefinition],
  };

  return { documentNode, changed: { fragmentName: uniqueFragmentName } };
};

const fixVariables = ({
  documentNode,
  operationInfoList,
}: {
  documentNode: DocumentNode;
  operationInfoList: OperationInfo[];
}): DocumentNode => {
  return visit(documentNode, {
    FragmentDefinition: {
      leave(fragmentDefinition) {
        let argumentDefinitionDataList: ArgumentDefinitionData[] = [];
        visit(fragmentDefinition, {
          Directive: {
            leave(node) {
              if (node.name.value !== ARGUMENT_DEFINITIONS_DIRECTIVE_NAME) return;
              argumentDefinitionDataList = getArgumentDefinitionDataList(node);
              return;
            },
          },
        });
        if (argumentDefinitionDataList.length === 0) return;

        return visit(fragmentDefinition, {
          Variable: {
            leave(variableNode) {
              // Find with operationInfoList because there may be more than one operation definition in documentNode
              const existsInVariable = existsVariable({
                variableName: variableNode.name.value,
                fragmentName: fragmentDefinition.name.value,
                operationInfoList,
              });
              if (existsInVariable) return;

              const argumentDefinitionData = argumentDefinitionDataList.find(
                (data) => data.name.value === variableNode.name.value,
              );
              if (!argumentDefinitionData) return;

              if (argumentDefinitionData.defaultValue) {
                // Replace with default value
                return { ...argumentDefinitionData.defaultValue };
              }

              if (argumentDefinitionData.type.kind !== 'NonNullType') {
                // Replace with null value
                const nullValueNode: NullValueNode = { kind: 'NullValue' };
                return nullValueNode;
              }
            },
          },
        }) as DocumentNode;
      },
    },
  }) as DocumentNode;
};

const getOperationInfoList = ({ documentFiles }: { documentFiles: Types.DocumentFile[] }): OperationInfo[] => {
  const fragmentDefinitions = getFragmentDefinitionsByDocumentFiles(documentFiles);
  const namesPairs: OperationInfo[] = [];
  documentFiles.map((file) => {
    if (!file.document) return file;
    const operationDefinitions = getOperationDefinitions(file.document);
    operationDefinitions.forEach((operationDefinition) => {
      if (!operationDefinition.variableDefinitions) return;

      const fragmentNames = getFragmentNames({
        targetDefinition: operationDefinition,
        fragmentDefinitions,
        fragmentNames: [],
      });

      const variableNames = operationDefinition.variableDefinitions.map(
        (variableDefinition) => variableDefinition.variable.name.value,
      );

      namesPairs.push({
        operationName: operationDefinition.name?.value,
        variableNames,
        belongsFragmentNames: fragmentNames,
      });
    });
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
  operationInfoList,
}: {
  variableName: string;
  fragmentName: string;
  operationInfoList: OperationInfo[];
}) => {
  const operationInfo = operationInfoList.find((info) =>
    info.belongsFragmentNames.find((name) => name === fragmentName),
  );
  if (!operationInfo) return false;

  return !!operationInfo.variableNames.find((name) => variableName === name);
};

export const exportedForTesting = {
  getOperationInfoList,
};
