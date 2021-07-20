export const getNodesFromConnection = <
  T extends {
    edges?: Array<{ node?: U | null } | undefined | null> | null;
  },
  U extends unknown,
>({
  connection,
}: {
  connection: T | undefined | null;
}): NonNullable<NonNullable<NonNullable<T['edges']>[0]>['node']>[] => {
  return connection?.edges?.map((edge) => edge?.node).filter((item): item is NonNullable<typeof item> => !!item) || [];
};
