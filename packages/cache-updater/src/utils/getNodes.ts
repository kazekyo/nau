export const getNodesFromConnection = <TNode>({
  connection,
}: {
  connection:
    | {
        edges?: Array<{ node?: TNode | null } | undefined | null> | null;
      }
    | undefined
    | null;
}): TNode[] => {
  return connection?.edges?.map((edge) => edge?.node).filter((item): item is NonNullable<typeof item> => !!item) || [];
};
