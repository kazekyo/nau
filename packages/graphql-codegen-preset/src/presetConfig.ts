export type PresetConfig = {
  /**
   * @name generateTypeScriptCode
   * @type boolean
   * @default false
   * @description Optional, generate TypeScript code.
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: @kazekyo/nau-graphql-codegen-preset
   *  presetConfig:
   *    generateTypeScriptCode: true
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-react-apollo
   * ```
   */
  generateTypeScriptCode?: boolean;
};
