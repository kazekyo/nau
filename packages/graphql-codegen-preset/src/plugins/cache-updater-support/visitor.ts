import { Types } from '@graphql-codegen/plugin-helpers';
import { ClientSideBaseVisitor, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { DeleteRecordMeta, DELETE_RECORD_DIRECTIVE_NAME, PaginationMeta } from '@nau/cache-updater';
import autoBind from 'auto-bind';
import {
  DirectiveNode,
  FieldNode,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  isListType,
  isObjectType,
  Kind,
  SelectionNode,
  TypeInfo,
} from 'graphql';
import { getFieldDef } from 'graphql/execution/execute';
import { PAGINATION_DIRECTIVE_NAME } from '../../utils/directive';
import { PaginationPluginConfig, PaginationRawPluginConfig } from './config';

export class PaginationVisitor extends ClientSideBaseVisitor<PaginationRawPluginConfig, PaginationPluginConfig> {
  private _typeInfo: TypeInfo;
  private _paginationMetaList: PaginationMeta[];
  private _deleteRecordMetaList: DeleteRecordMeta[];

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
    this._deleteRecordMetaList = [];

    autoBind(this);
  }

  public getImports(): string[] {
    return [
      `import { TypePolicy } from '@apollo/client';`,
      `import { withCacheUpdaterInternal } from '@nau/cache-updater';`,
    ];
  }

  public getContent(): string {
    return [
      this.getPaginationMetaListContent(),
      this.getDeleteRecordMetaListContent(),
      this.getWithCacheUpdaterContent(),
    ].join('\n');
  }

  public getWithCacheUpdaterContent(): string {
    const parentTypenames = this._paginationMetaList
      .map((meta) => meta.parents)
      .flat()
      .map((parent) => parent.typename);

    const str = `
export type CacheUpdaterTypePolicies = {
  ${parentTypenames.map((typename) => `${typename}: TypePolicy;`).join('\n  ')}
  [__typename: string]: TypePolicy;
};

export const withCacheUpdater = (typePolicies: CacheUpdaterTypePolicies) =>
  withCacheUpdaterInternal({
    paginationMetaList,
    deleteRecordMetaList,
    typePolicies,
  });`;
    return str;
  }

  private getPaginationMetaListContent(): string {
    return '\n' + `export const paginationMetaList = ${this.printMetaListTypeScriptCode(this._paginationMetaList)};`;
  }

  private getDeleteRecordMetaListContent(): string {
    return (
      '\n' + `export const deleteRecordMetaList = ${this.printMetaListTypeScriptCode(this._deleteRecordMetaList)};`
    );
  }

  private printMetaListTypeScriptCode(object: unknown): string {
    if (typeof object === 'string') {
      return `'${object}'`;
    } else if (Array.isArray(object)) {
      return `[${object.map((v) => this.printMetaListTypeScriptCode(v)).join(', ')}]`;
    } else {
      const metaObject = object as { [key: string]: unknown };
      const list = Object.entries(metaObject).map(([k, v]) => `${k}: ${this.printMetaListTypeScriptCode(v)}`);
      return `{ ${list.join(', ')} }`;
    }
  }

  public Directive(directiveNode: DirectiveNode): void {
    if (directiveNode.name.value !== DELETE_RECORD_DIRECTIVE_NAME) return;
  }

  public Field(fieldNode: FieldNode): void {
    const paginationMeta = this.findPaginationMeta(fieldNode);
    if (paginationMeta) {
      this.addPaginationMetaToList(paginationMeta);
    }

    const deleteRecordMeta = this.findDeleteRecordMeta(fieldNode);
    if (deleteRecordMeta) {
      this.addDeleateRecordMetaToList(deleteRecordMeta);
    }
  }

  private isFieldNode(selection: SelectionNode, name: string): boolean {
    return selection.kind === 'Field' && selection.name.value === name;
  }

  private findDeleteRecordMeta(fieldNode: FieldNode): DeleteRecordMeta | undefined {
    if (!fieldNode.directives) return;
    const deleteRecordDirective = fieldNode.directives.find(
      (directive) => directive.name.value === DELETE_RECORD_DIRECTIVE_NAME,
    );
    if (!deleteRecordDirective || !deleteRecordDirective.arguments) return;

    const parentType = this._typeInfo.getParentType();
    if (!parentType) return;

    const argument = deleteRecordDirective.arguments[0];
    if (argument.value.kind !== Kind.STRING) return;
    const typename = argument.value.value;

    return { parent: { typename: parentType.toString() }, fields: [{ fieldName: fieldNode.name.value, typename }] };
  }

  private addDeleateRecordMetaToList(deleteRecordMeta: DeleteRecordMeta): void {
    const indexInMetaList = this._deleteRecordMetaList.findIndex(
      (meta) => meta.parent.typename === deleteRecordMeta.parent.typename,
    );
    if (indexInMetaList === -1) {
      this._deleteRecordMetaList.push(deleteRecordMeta);
      return;
    }

    const newField = deleteRecordMeta.fields[0];

    const existingMetaObject = this._deleteRecordMetaList[indexInMetaList];
    const existingField = existingMetaObject.fields.find(
      (field) => field.fieldName === newField.fieldName && field.typename === newField.typename,
    );
    if (existingField) return;

    this._deleteRecordMetaList[indexInMetaList] = {
      ...existingMetaObject,
      fields: [...existingMetaObject.fields, newField],
    };
  }

  private findPaginationMeta(fieldNode: FieldNode): PaginationMeta | undefined {
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

    return {
      node: { typename: nodeType.toString() },
      parents: [newParentMeta],
    };
  }

  private addPaginationMetaToList(paginationMeta: PaginationMeta): void {
    const nodeIndexInMetaList = this._paginationMetaList.findIndex(
      (meta) => meta.node.typename === paginationMeta.node.typename,
    );
    if (nodeIndexInMetaList === -1) {
      this._paginationMetaList.push(paginationMeta);
      return;
    }

    const newParent = paginationMeta.parents[0];

    const existingMetaObject = this._paginationMetaList[nodeIndexInMetaList];
    const existingParent = existingMetaObject.parents.find(
      (parent) =>
        parent.typename === newParent.typename &&
        parent.connection.fieldName === newParent.connection.fieldName &&
        parent.edge.typename === newParent.edge.typename,
    );
    if (existingParent) return;

    this._paginationMetaList[nodeIndexInMetaList] = {
      ...existingMetaObject,
      parents: [...existingMetaObject.parents, newParent],
    };
  }
}
