import { type ReadonlyJSONValue } from "replicache";

function constructIDBKey(arr: Array<string | number | null | undefined>): string {
  return arr
    .filter((i): i is string | number => i !== undefined && i !== null)
    .map((i) => encodeURIComponent(String(i)))
    .join("/");
}

export const IDB_KEY = {
  /**
   * Last param should be '', to make it `/note/` rather than `/note`
   *
   * @example
   * await tx.scan(IDB_KEY.NOTE({})))
   * 'note/' --> list of notes
   *
   * await tx.set(IDB_KEY.NOTE({id: '1'})))
   * 'note/1' --> note with id '1'
   */
  NOTE: ({ id = "" }: { id?: string }) => constructIDBKey(["note", id]),
};
export type IDBKeys = keyof typeof IDB_KEY;

/**
 * Normalize data to readonly json value
 * to be stored onto index db
 *
 * @returns
 */
export function normalizeToReadonlyJSON(args: unknown) {
  return args as ReadonlyJSONValue;
}