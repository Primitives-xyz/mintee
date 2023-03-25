/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Context, Serializer } from '@metaplex-foundation/umi';

export enum TokenDelegateRole {
  Sale,
  Transfer,
  Utility,
  Staking,
  Standard,
  LockedTransfer,
  Migration,
}

export type TokenDelegateRoleArgs = TokenDelegateRole;

export function getTokenDelegateRoleSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<TokenDelegateRoleArgs, TokenDelegateRole> {
  const s = context.serializer;
  return s.enum<TokenDelegateRole>(TokenDelegateRole, {
    description: 'TokenDelegateRole',
  }) as Serializer<TokenDelegateRoleArgs, TokenDelegateRole>;
}
