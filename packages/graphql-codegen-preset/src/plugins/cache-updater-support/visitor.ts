import { Types } from '@graphql-codegen/plugin-helpers';
import { ClientSideBaseVisitor, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  FieldNode,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  isListType,
  isObjectType,
  SelectionNode,
  TypeInfo,
} from 'graphql';
import { getFieldDef } from 'graphql/execution/execute';
import { PaginationMeta } from '@nau/cache-updater';
import { PAGINATION_DIRECTIVE_NAME } from '../../utils/directive';
import { PaginationPluginConfig, PaginationRawPluginConfig } from './config';

export class PaginationVisitor extends ClientSideBaseVisitor<PaginationRawPluginConfig, PaginationPluginConfig> {
  private _typeInfo: TypeInfo;
  private _paginationMetaList: PaginationMeta[];

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: PaginationRawPluginConfig,
    documents: Types.DocumentFile[],
    typeInfo: TypeInfo,
  ) {
    super(schema, fragments, rawConfig, {});

    this._typeInfo = typeInfo;
    this._documents = documents;
    this._paginationMetaList = [];

    autoBind(this);
  }

  public getImports(): string[] {
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return [];
    }

    return [`import { DocumentNode, GraphQLSchema, TypeInfo } from 'graphql'`];
  }
  public getPaginationMetaListContent(): string {
    return `export const paginationMetaList = ${this.printPaginationMetaListTypeScriptCode(this._paginationMetaList)}`;
  }

  private printPaginationMetaListTypeScriptCode(object: unknown): string {
    if (typeof object === 'string') {
      return `'${object}'`;
    } else if (Array.isArray(object)) {
      return `[${object.map((v) => this.printPaginationMetaListTypeScriptCode(v)).join(', ')}]`;
    } else {
      const metaObject = object as PaginationMeta;
      const list = Object.entries(metaObject).map(([k, v]) => `${k}: ${this.printPaginationMetaListTypeScriptCode(v)}`);
      return `{ ${list.join(', ')} }`;
    }
  }

  private isFieldNode(selection: SelectionNode, name: string): boolean {
    return selection.kind === 'Field' && selection.name.value === name;
  }

  public Field(fieldNode: FieldNode): void {
    if (!fieldNode.directives) return;
    const paginationDirective = fieldNode.directives.find(
      (directive) => directive.name.value === PAGINATION_DIRECTIVE_NAME,
    );
    if (!paginationDirective) return;

    if (!fieldNode.selectionSet) return;

    const edgesFieldNode = fieldNode.selectionSet.selections.find((selection): selection is FieldNode =>
      this.isFieldNode(selection, 'edges'),
    );

    if (!edgesFieldNode || !edgesFieldNode.selectionSet) return;

    const nodeFieldNode = edgesFieldNode.selectionSet.selections.find((selection): selection is FieldNode =>
      this.isFieldNode(selection, 'node'),
    );
    if (!nodeFieldNode) return;

    const connectionType = this._typeInfo.getType() as GraphQLObjectType;
    if (!connectionType) return;

    const edgesFieldDef = getFieldDef(this._schema, connectionType, 'edges');
    if (!edgesFieldDef || !isListType(edgesFieldDef?.type)) return;
    const edgeType = (edgesFieldDef.type as GraphQLList<GraphQLObjectType>).ofType;

    const nodeFieldDef = getFieldDef(this._schema, edgeType, 'node');
    if (!nodeFieldDef || !isObjectType(nodeFieldDef.type)) return;
    const nodeType = nodeFieldDef.type;

    const parentType = this._typeInfo.getParentType();
    if (!parentType) return;

    const newParentMeta: PaginationMeta['parents']['0'] = {
      typename: parentType.toString(),
      connection: { fieldName: fieldNode.name.value },
      edge: { typename: edgeType.toString() },
    };

    const newMetaObject: PaginationMeta = {
      node: { typename: nodeType.toString() },
      parents: [newParentMeta],
    };

    const nodeIndexInMetaList = this._paginationMetaList.findIndex(
      (meta) => meta.node.typename === newMetaObject.node.typename,
    );
    if (nodeIndexInMetaList === -1) {
      this._paginationMetaList.push(newMetaObject);
      return;
    }

    const existingMetaObject = this._paginationMetaList[nodeIndexInMetaList];
    const existingParentMeta = existingMetaObject.parents.find(
      (parent) =>
        parent.typename === newParentMeta.typename &&
        parent.connection.fieldName === newParentMeta.connection.fieldName &&
        parent.edge.typename === newParentMeta.edge.typename,
    );
    if (existingParentMeta) return;

    this._paginationMetaList[nodeIndexInMetaList] = {
      ...existingMetaObject,
      parents: [...existingMetaObject.parents, newParentMeta],
    };
  }
}
