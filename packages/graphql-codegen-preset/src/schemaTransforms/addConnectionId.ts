import { Types } from '@graphql-codegen/plugin-helpers';
import { PAGINATION_DIRECTIVE_NAME } from '@kazekyo/nau';
import {
  concatAST,
  extendSchema,
  FieldDefinitionNode,
  GraphQLSchema,
  Kind,
  NameNode,
  ObjectTypeExtensionNode,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { uniq } from 'lodash';
import { getConnectionType, getEdgeType, getNodeType } from '../utils/graphqlSchema';
import { nonNullable } from '../utils/nonNullable';

export const addConnectionId = (
  schema: GraphQLSchema,
  documentFiles: Types.DocumentFile[],
): { schema: GraphQLSchema } => {
  const documents = documentFiles.map((file) => file.document).filter(nonNullable);
  const allAst = concatAST(documents);

  const paginationTypes: string[] = [];
  const typeInfo = new TypeInfo(schema);
  visit(
    allAst,
    visitWithTypeInfo(typeInfo, {
      Field: {
        leave(fieldNode) {
          if (!fieldNode.directives) return;
          const paginationDirective = fieldNode.directives.find(
            (directive) => directive.name.value === PAGINATION_DIRECTIVE_NAME,
          );
          if (!paginationDirective) return;

          const connectionType = getConnectionType({ type: typeInfo.getType() });
          if (!connectionType) return;
          const edgeType = getEdgeType({ connectionType, schema });
          if (!edgeType) return;
          const nodeType = getNodeType({ edgeType, schema });
          if (!nodeType) return;

          paginationTypes.push(connectionType.name);
        },
      },
    }),
  );

  const definitions = uniq(paginationTypes).map((typename) => generateExtendConnectionType(typename));
  const result = extendSchema(schema, { kind: Kind.DOCUMENT, definitions });

  return { schema: result };
};

const generateExtendConnectionType = (connectionTypeName: string): ObjectTypeExtensionNode => {
  const name: NameNode = {
    kind: Kind.NAME,
    value: connectionTypeName,
  };
  const field: FieldDefinitionNode = {
    kind: Kind.FIELD_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: '_connectionId',
    },
    description: {
      kind: Kind.STRING,
      value: 'Information of the connection for a client',
    },
    type: {
      kind: Kind.NON_NULL_TYPE,
      type: {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
          value: 'String',
        },
      },
    },
  };
  const extentions: ObjectTypeExtensionNode = {
    kind: Kind.OBJECT_TYPE_EXTENSION,
    name: name,
    fields: [field],
  };
  return extentions;
};
