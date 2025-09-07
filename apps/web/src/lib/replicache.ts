import { type ReadonlyJSONValue } from "@vesper/models/client";
import { convertISOStringToDate } from "./date";


export function normalizeReplicacheData<T>(data: (readonly [string, ReadonlyJSONValue])[]) {
  const arrayOfObjects = data.map(([, _value]) => _value);

  return convertISOStringToDate(arrayOfObjects) as T[];
}

export function normalizeReplicacheDataObject<T>(data: unknown) {
  if (data === undefined || data === null) return null;

  return convertISOStringToDate(data) as T;
}