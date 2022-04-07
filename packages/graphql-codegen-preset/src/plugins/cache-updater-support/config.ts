import { ClientSideBasePluginConfig, RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PaginationConfig {}

export interface PaginationRawPluginConfig extends RawClientSideBasePluginConfig, PaginationConfig {}
export interface PaginationPluginConfig extends ClientSideBasePluginConfig, PaginationConfig {}
