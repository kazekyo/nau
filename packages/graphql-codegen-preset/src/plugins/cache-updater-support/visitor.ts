import { Types } from '@graphql-codegen/plugin-helpers';
import { ClientSideBaseVisitor, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { DeleteRecordMeta, DELETE_RECORD_DIRECTIVE_NAME, PaginationMeta, PAGINATION_DIRECTIVE_NAME } from '@kazekyo/nau';
import autoBind from 'auto-bind';
import { DirectiveNode, FieldNode, GraphQLSchema, Kind, TypeInfo } from 'graphql';
import { getConnectionType, getEdgeType, getNodeType } from '../../utils/graphqlSchema';
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
    return [`import { TypePolicy } from '@apollo/client';`, `import { withCacheUpdaterInternal } from '@kazekyo/nau';`];
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

    const connectionType = getConnectionType({ type: this._typeInfo.getType() });
    if (!connectionType) return;

    const edgeType = getEdgeType({ connectionType, schema: this._schema });
    if (!edgeType) return;

    const nodeType = getNodeType({ edgeType, schema: this._schema });
    if (!nodeType) return;

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
