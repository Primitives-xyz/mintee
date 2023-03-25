/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  GetDataEnumKind,
  GetDataEnumKindContent,
  Serializer,
} from '@metaplex-foundation/umi';

export type CollectionDetails = { __kind: 'V1'; size: bigint };

export type CollectionDetailsArgs = { __kind: 'V1'; size: number | bigint };

export function getCollectionDetailsSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<CollectionDetailsArgs, CollectionDetails> {
  const s = context.serializer;
  return s.dataEnum<CollectionDetails>(
    [
      [
        'V1',
        s.struct<GetDataEnumKindContent<CollectionDetails, 'V1'>>(
          [['size', s.u64()]],
          { description: 'V1' }
        ),
      ],
    ],
    { description: 'CollectionDetails' }
  ) as Serializer<CollectionDetailsArgs, CollectionDetails>;
}

// Data Enum Helpers.
export function collectionDetails(
  kind: 'V1',
  data: GetDataEnumKindContent<CollectionDetailsArgs, 'V1'>
): GetDataEnumKind<CollectionDetailsArgs, 'V1'>;
export function collectionDetails<K extends CollectionDetailsArgs['__kind']>(
  kind: K,
  data?: any
): Extract<CollectionDetailsArgs, { __kind: K }> {
  return Array.isArray(data)
    ? { __kind: kind, fields: data }
    : { __kind: kind, ...(data ?? {}) };
}
export function isCollectionDetails<K extends CollectionDetails['__kind']>(
  kind: K,
  value: CollectionDetails
): value is CollectionDetails & { __kind: K } {
  return value.__kind === kind;
}
