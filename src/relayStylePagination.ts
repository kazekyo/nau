/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FieldPolicy, Reference } from '@apollo/client/cache';
import { mergeDeep } from '@apollo/client/utilities';
import { __rest } from 'tslib';

type KeyArgs = FieldPolicy<any>['keyArgs'];

export type TRelayEdge<TNode> =
  | {
      cursor?: string;
      node: TNode;
    }
  | (Reference & { cursor?: string });

export type TRelayPageInfo = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
};

export type TExistingRelay<TNode> = Readonly<{
  edges: TRelayEdge<TNode>[];
  pageInfo: TRelayPageInfo;
}>;

export type TIncomingRelay<TNode> = {
  edges?: TRelayEdge<TNode>[];
  pageInfo?: TRelayPageInfo;
};

export type RelayFieldPolicy<TNode> = FieldPolicy<TExistingRelay<TNode>, TIncomingRelay<TNode>, TIncomingRelay<TNode>>;

// This function is a bit different from the one provided by Apollo.
// 1. it removes duplicate edges.
//  As a result of the misaligned cursor,
//  if a client gets data from a server with duplicate nodes,
//  it will remove duplicate edges from a list.
// 2. it sets a args to a connection.
//  The args is needed to identify the connection to be updated.
export function relayStylePagination<TNode extends Reference>(keyArgs: KeyArgs = false): RelayFieldPolicy<TNode> {
  return {
    keyArgs,

    read(existing, { canRead, readField }) {
      if (!existing) return;

      const edges: TRelayEdge<TNode>[] = [];
      let startCursor = '';
      let endCursor = '';
      existing.edges.forEach((edge) => {
        // Edges themselves could be Reference objects, so it's important
        // to use readField to access the edge.edge.node property.
        if (canRead(readField('node', edge))) {
          edges.push(edge);
          if (edge.cursor) {
            startCursor = startCursor || edge.cursor;
            endCursor = edge.cursor;
          }
        }
      });

      return {
        // Some implementations return additional Connection fields, such
        // as existing.totalCount. These fields are saved by the merge
        // function, so the read function should also preserve them.
        ...getExtras(existing),
        edges,
        pageInfo: {
          ...existing.pageInfo,
          startCursor,
          endCursor,
        },
      };
    },

    merge(existing = makeEmptyData(), incoming, { args, isReference, readField }) {
      const incomingEdges = incoming.edges
        ? incoming.edges.map((edge) => {
            if (isReference((edge = { ...edge }))) {
              // In case edge is a Reference, we read out its cursor field and
              // store it as an extra property of the Reference object.
              edge.cursor = readField<string>('cursor', edge);
            }
            return edge;
          })
        : [];

      if (incoming.pageInfo) {
        const { pageInfo } = incoming;
        const { startCursor, endCursor } = pageInfo;
        const firstEdge = incomingEdges[0];
        const lastEdge = incomingEdges[incomingEdges.length - 1];
        // In case we did not request the cursor field for edges in this
        // query, we can still infer cursors from pageInfo.
        if (firstEdge && startCursor) {
          firstEdge.cursor = startCursor;
        }
        if (lastEdge && endCursor) {
          lastEdge.cursor = endCursor;
        }
        // Cursors can also come from edges, so we default
        // pageInfo.{start,end}Cursor to {first,last}Edge.cursor.
        const firstCursor = firstEdge && firstEdge.cursor;
        if (firstCursor && !startCursor) {
          incoming = mergeDeep(incoming, {
            pageInfo: {
              startCursor: firstCursor,
            },
          });
        }
        const lastCursor = lastEdge && lastEdge.cursor;
        if (lastCursor && !endCursor) {
          incoming = mergeDeep(incoming, {
            pageInfo: {
              endCursor: lastCursor,
            },
          });
        }
      }

      let prefix = existing.edges;
      let suffix: typeof prefix = [];

      if (args && args.after) {
        // This comparison does not need to use readField("cursor", edge),
        // because we stored the cursor field of any Reference edges as an
        // extra property of the Reference object.
        const index = prefix.findIndex((edge) => edge.cursor === args.after);
        if (index >= 0) {
          prefix = prefix.slice(0, index + 1);
          // suffix = []; // already true
        }
      } else if (args && args.before) {
        const index = prefix.findIndex((edge) => edge.cursor === args.before);
        suffix = index < 0 ? prefix : prefix.slice(index);
        prefix = [];
      } else if (incoming.edges) {
        // If we have neither args.after nor args.before, the incoming
        // edges cannot be spliced into the existing edges, so they must
        // replace the existing edges. See #6592 for a motivating example.
        prefix = [];
      }

      // We will remove duplidate edges if we have.
      const edges = [
        ...removeDuplidateEdgeFromExisting({
          existingEdges: prefix,
          incomingEdges,
        }),
        ...incomingEdges,
        ...removeDuplidateEdgeFromExisting({
          existingEdges: suffix,
          incomingEdges,
        }),
      ];

      const pageInfo: TRelayPageInfo = {
        // The ordering of these two ...spreads may be surprising, but it
        // makes sense because we want to combine PageInfo properties with a
        // preference for existing values, *unless* the existing values are
        // overridden by the logic below, which is permitted only when the
        // incoming page falls at the beginning or end of the data.
        ...incoming.pageInfo,
        ...existing.pageInfo,
      };

      if (incoming.pageInfo) {
        const { hasPreviousPage, hasNextPage, startCursor, endCursor, ...extras } = incoming.pageInfo;

        // If incoming.pageInfo had any extra non-standard properties,
        // assume they should take precedence over any existing properties
        // of the same name, regardless of where this page falls with
        // respect to the existing data.
        Object.assign(pageInfo, extras);

        // Keep existing.pageInfo.has{Previous,Next}Page unless the
        // placement of the incoming edges means incoming.hasPreviousPage
        // or incoming.hasNextPage should become the new values for those
        // properties in existing.pageInfo. Note that these updates are
        // only permitted when the beginning or end of the incoming page
        // coincides with the beginning or end of the existing data, as
        // determined using prefix.length and suffix.length.
        if (!prefix.length) {
          if (void 0 !== hasPreviousPage) pageInfo.hasPreviousPage = hasPreviousPage;
          if (void 0 !== startCursor) pageInfo.startCursor = startCursor;
        }
        if (!suffix.length) {
          if (void 0 !== hasNextPage) pageInfo.hasNextPage = hasNextPage;
          if (void 0 !== endCursor) pageInfo.endCursor = endCursor;
        }
      }

      return {
        ...getExtras(existing),
        ...getExtras(incoming),
        edges,
        pageInfo,
        args, // The args is needed to identify the different pagination of the args
      };
    },
  };
}

const removeDuplidateEdgeFromExisting = <TNode extends Reference>({
  existingEdges,
  incomingEdges,
}: {
  existingEdges: TRelayEdge<TNode>[];
  incomingEdges: TRelayEdge<TNode>[];
}): TRelayEdge<TNode>[] => {
  return existingEdges.filter((existingEdge) => {
    if (!('node' in existingEdge)) return false;
    const duplicateEdge = incomingEdges.find((incomingEdge) => {
      if (!('node' in incomingEdge)) return false;
      return existingEdge.node.__ref === incomingEdge.node.__ref;
    });
    return !duplicateEdge;
  });
};

// Returns any unrecognized properties of the given object.
const getExtras = (obj: Record<string, any>) => __rest(obj, notExtras);
const notExtras = ['edges', 'pageInfo'];

function makeEmptyData(): TExistingRelay<any> {
  return {
    edges: [],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: '',
      endCursor: '',
    },
  };
}
