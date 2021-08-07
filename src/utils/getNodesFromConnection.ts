export const getNodesFromConnection = <
  TConnection extends {
    edges?: Array<{ node?: TNode | null } | undefined | null> | null;
  },
  TNode extends unknown,
>({
  connection,
}: {
  connection: TConnection | undefined | null;
}): TNode[] => {
  return connection?.edges?.map((edge) => edge?.node).filter((item): item is NonNullable<typeof item> => !!item) || [];
};
