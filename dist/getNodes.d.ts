export declare const getNodesFromConnection: <T extends {
    edges?: ({
        node?: U | null | undefined;
    } | null | undefined)[] | null | undefined;
}, U extends unknown>({ connection, }: {
    connection: T | null | undefined;
}) => NonNullable<NonNullable<NonNullable<T["edges"]>[0]>["node"]>[];
