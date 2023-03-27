/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Context, Serializer } from '@metaplex-foundation/umi';

export enum PayloadKey {
  Amount,
  Authority,
  AuthoritySeeds,
  Delegate,
  DelegateSeeds,
  Destination,
  DestinationSeeds,
  Holder,
  Source,
  SourceSeeds,
}

export type PayloadKeyArgs = PayloadKey;

export function getPayloadKeySerializer(
  context: Pick<Context, 'serializer'>
): Serializer<PayloadKeyArgs, PayloadKey> {
  const s = context.serializer;
  return s.enum<PayloadKey>(PayloadKey, {
    description: 'PayloadKey',
  }) as Serializer<PayloadKeyArgs, PayloadKey>;
}