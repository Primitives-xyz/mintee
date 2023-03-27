/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Context, PublicKey, Serializer } from '@metaplex-foundation/umi';

export type Creator = { address: PublicKey; verified: boolean; share: number };

export type CreatorArgs = Creator;

export function getCreatorSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<CreatorArgs, Creator> {
  const s = context.serializer;
  return s.struct<Creator>(
    [
      ['address', s.publicKey()],
      ['verified', s.bool()],
      ['share', s.u8()],
    ],
    { description: 'Creator' }
  ) as Serializer<CreatorArgs, Creator>;
}