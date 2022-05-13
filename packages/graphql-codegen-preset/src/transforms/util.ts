import { ARGUMENT_DEFINITIONS_DIRECTIVE_NAME } from '@kazekyo/nau';
import { ConstValueNode, DirectiveNode, FragmentDefinitionNode, Kind, NameNode, parseType, TypeNode } from 'graphql';
import { decode, encode } from 'js-base64';

export const mergeCustomizer = (objValue: unknown, srcValue: unknown): unknown => {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return objValue.concat(srcValue) as unknown[];
  }
};

export const FRAGMENT_NAME_INFO_ID_1 = '1';
export const FRAGMENT_NAME_INFO_ID_2 = '2';
export const FRAGMENT_NAME_INFO_ID_3 = '3';

export const getUniqueFragmentName = (name: string, info: string): string => {
  const splitName = name.split('_');
  const endStr = splitName.pop();
  if (splitName.length === 1 || !endStr) return `${name}_${encode('n/' + info, true)}`;

  const decodedInfo = decode(endStr);
  const isAlreadyUniqueName = decodedInfo.startsWith('n/');
  if (!isAlreadyUniqueName) return `${name}_${encode('n/' + info, true)}`;

  return `${splitName.join('_')}_${encode(decodedInfo + '/' + info, true)}`;
};

export type ArgumentDefinitionData = { name: NameNode; type: TypeNode; defaultValue?: ConstValueNode };
export const getArgumentDefinitionDataList = (node: DirectiveNode): ArgumentDefinitionData[] => {
  if (node.name.value !== ARGUMENT_DEFINITIONS_DIRECTIVE_NAME) return [];
  if (!node.arguments || node.arguments.length === 0) return [];

  const list: ArgumentDefinitionData[] = [];

  // Example: node is @argumentDefinitions(arg1: { type: "Int", defaultValue: 10 })
  node.arguments.forEach((argument) => {
    if (argument.value.kind !== 'ObjectValue') return;
    const name = argument.name; // Example: name is arg1

    const typeField = argument.value.fields.find((field) => field.name.value === 'type');
    let typeString: string | undefined;
    if (typeField && typeField.value.kind === Kind.STRING) {
      typeString = typeField.value.value; // Example: typeString is "Int"
    }
    if (!typeString) return;

    const defaultValueField = argument.value.fields.find((field) => field.name.value === 'defaultValue');
    const defaultValue = defaultValueField?.value; // Example: defaultValue is 10
    let defaultConstValue: ConstValueNode | undefined = undefined;
    if (defaultValue && defaultValue.kind !== Kind.VARIABLE) {
      defaultConstValue = defaultValue as ConstValueNode;
    }

    list.push({ name, type: parseType(typeString), defaultValue: defaultConstValue });
  });
  return list;
};

// TODO : Delete
export type ChangedFragments = { [originalFragmentName: string]: FragmentDefinitionNode[] };
export const addFragmentToChangedFragment = ({
  originalFragmentName,
  changedFragments,
  changedFragmentDefinition,
}: {
  originalFragmentName: string;
  changedFragments: ChangedFragments;
  changedFragmentDefinition: FragmentDefinitionNode;
}): ChangedFragments => {
  const definitions = changedFragments[originalFragmentName] || [];
  if (definitions.find((definition) => definition.name.value === changedFragmentDefinition.name.value)) {
    return changedFragments;
  }
  definitions.push(changedFragmentDefinition);
  changedFragments[originalFragmentName] = definitions;
  return changedFragments;
};

export const existsFragmentDefinitionInChangedFragments = ({
  changedFragments,
  newFragmentName,
}: {
  changedFragments: ChangedFragments;
  newFragmentName: string;
}): boolean => {
  const fragmentDefinitions = Object.entries(changedFragments)
    .map(([_, fragments]) => fragments)
    .flat();
  return !!fragmentDefinitions.find((definition) => definition.name.value === newFragmentName);
};
