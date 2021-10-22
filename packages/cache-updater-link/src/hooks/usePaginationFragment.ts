import { ApolloQueryResult, gql, useApolloClient } from '@apollo/client';
import { DocumentNode } from 'graphql/language';
import { useCallback, useEffect, useState } from 'react';
import { ContextType } from '../links';
import { defaultCacheIdGenerator } from '../policies/cacheUpdater';
import { getFragmentDefinitions } from '../utils';

type PaginationFragmentResult<TFragmentData> = {
  data: TFragmentData | null;
  loadNext: LoadPageFunction<TFragmentData>;
  loadPrevious: LoadPageFunction<TFragmentData>;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoadingNext: boolean;
  isLoadingPrevious: boolean;
};

type OnCompleteFunction<T> = (result: ApolloQueryResult<T>) => void;
export type LoadPageFunction<TFragmentData> = (
  count: number,
  options?: { onComplete?: OnCompleteFunction<TFragmentData> },
) => void;

type PageInfo = { startCursor?: string; endCursor?: string; hasNextPage: boolean; hasPreviousPage: boolean };

// eslint-disable-next-line @typescript-eslint/ban-types
const findPageInfo = (data: object | null): PageInfo => {
  let pageInfo: PageInfo = { hasNextPage: false, hasPreviousPage: false };
  if (!data) return pageInfo;
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'pageInfo') {
      pageInfo = { ...pageInfo, ...value } as PageInfo;
    } else if (typeof value === 'object' && key !== 'edges') {
      pageInfo = { ...pageInfo, ...findPageInfo(value) };
    }
  });
  return pageInfo;
};

export const usePaginationFragment = <TFragmentData extends { [name: string]: unknown }>({
  id,
  fragment,
  fragmentName,
}: {
  id: string;
  fragment: DocumentNode;
  fragmentName?: string;
}): PaginationFragmentResult<TFragmentData> => {
  const client = useApolloClient();
  const [data, setData] = useState<TFragmentData | null | undefined>(undefined);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [startCursor, setStartCursor] = useState<string | undefined>(undefined);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoadingNext, setLoadingNext] = useState(false);
  const [isLoadingPrevious, setLoadingPrevious] = useState(false);

  const fragmentDefinitions = getFragmentDefinitions(fragment);
  if (fragmentDefinitions.length === 0) {
    throw new Error(`The fragment does not exist.`);
  } else if (fragmentDefinitions.length > 1 && !fragmentName) {
    throw Error(
      `Found ${fragmentDefinitions.length} fragments. \`fragmentName\` must be provided when there is not exactly 1 fragment.`,
    );
  }

  const mainFragmentName = fragmentName || fragmentDefinitions[0].name.value;
  const filledFragment = fragment; // TODO : Add `edges.cursor` and `pageInfo`

  const readDataFromCache = useCallback(() => {
    const data = client.readFragment<TFragmentData>({
      id: defaultCacheIdGenerator(id),
      fragment: filledFragment,
      fragmentName: mainFragmentName,
    });
    return data;
  }, [client, id, fragment, mainFragmentName]);

  const setPageInfo = useCallback((pageInfo: PageInfo) => {
    setStartCursor(pageInfo.startCursor);
    setEndCursor(pageInfo.endCursor);
    setHasNext(pageInfo.hasNextPage);
    setHasPrevious(pageInfo.hasPreviousPage);
  }, []);

  useEffect(() => {
    const initialData = readDataFromCache();
    setData(initialData);
    setPageInfo(findPageInfo(initialData));
  }, [id, readDataFromCache, setPageInfo]);

  const currentData = readDataFromCache();
  if (currentData !== data) {
    setData(currentData);
    setPageInfo(findPageInfo(currentData));
  }

  const load = useCallback(
    ({
      count,
      setLoading,
      type,
      options,
    }: {
      count: number;
      setLoading: (flag: boolean) => void;
      type: 'next' | 'previous';
      options?: { onComplete?: OnCompleteFunction<TFragmentData> };
    }) => {
      setLoading(true);
      const variables = { id: id };
      const paginationQuery = gql`
        query TemporaryPaginationQuery($id: ID!) {
          node(id: $id) {
            ...${mainFragmentName}
          }
        }
        ${filledFragment}
      `;
      const context: ContextType = {
        nau: {
          refetch: { fragmentName: mainFragmentName },
          connection: { variables: { count, cursor: (type === 'next' ? endCursor : startCursor) as string } },
        },
      };
      void client
        .query({
          query: paginationQuery,
          variables,
          fetchPolicy: 'network-only',
          context,
        })
        .then((result) => {
          setLoading(false);
          if (result.data) {
            // result.data is only for 1 page, so we need to retrieve data from cache
            const newData = readDataFromCache();
            setData(newData);
            setPageInfo(findPageInfo(result.data));
          }
          if (!options?.onComplete) return;
          options.onComplete(result);
        });
    },
    [client, readDataFromCache, setPageInfo, endCursor, startCursor, id, fragment, fragmentName],
  );

  const loadNext: LoadPageFunction<TFragmentData> = (count, options) =>
    load({ count, setLoading: setLoadingNext, type: 'next', options });
  const loadPrevious: LoadPageFunction<TFragmentData> = (count, options) =>
    load({ count, setLoading: setLoadingPrevious, type: 'previous', options });

  return {
    data: data === undefined ? readDataFromCache() : data,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious,
  };
};
