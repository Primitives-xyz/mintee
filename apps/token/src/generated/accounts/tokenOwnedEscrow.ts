/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  Serializer,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  mapSerializer,
} from '@metaplex-foundation/umi';
import {
  EscrowAuthority,
  EscrowAuthorityArgs,
  Key,
  KeyArgs,
  getEscrowAuthoritySerializer,
  getKeySerializer,
} from '../types';

export type TokenOwnedEscrow = Account<TokenOwnedEscrowAccountData>;

export type TokenOwnedEscrowAccountData = {
  key: Key;
  baseToken: PublicKey;
  authority: EscrowAuthority;
  bump: number;
};

export type TokenOwnedEscrowAccountDataArgs = {
  baseToken: PublicKey;
  authority: EscrowAuthorityArgs;
  bump: number;
};

export function getTokenOwnedEscrowAccountDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<TokenOwnedEscrowAccountDataArgs, TokenOwnedEscrowAccountData> {
  const s = context.serializer;
  return mapSerializer<
    TokenOwnedEscrowAccountDataArgs,
    TokenOwnedEscrowAccountData,
    TokenOwnedEscrowAccountData
  >(
    s.struct<TokenOwnedEscrowAccountData>(
      [
        ['key', getKeySerializer(context)],
        ['baseToken', s.publicKey()],
        ['authority', getEscrowAuthoritySerializer(context)],
        ['bump', s.u8()],
      ],
      { description: 'TokenOwnedEscrow' }
    ),
    (value) =>
      ({ ...value, key: Key.TokenOwnedEscrow } as TokenOwnedEscrowAccountData)
  ) as Serializer<TokenOwnedEscrowAccountDataArgs, TokenOwnedEscrowAccountData>;
}

export function deserializeTokenOwnedEscrow(
  context: Pick<Context, 'serializer'>,
  rawAccount: RpcAccount
): TokenOwnedEscrow {
  return deserializeAccount(
    rawAccount,
    getTokenOwnedEscrowAccountDataSerializer(context)
  );
}

export async function fetchTokenOwnedEscrow(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKey: PublicKey,
  options?: RpcGetAccountOptions
): Promise<TokenOwnedEscrow> {
  const maybeAccount = await context.rpc.getAccount(publicKey, options);
  assertAccountExists(maybeAccount, 'TokenOwnedEscrow');
  return deserializeTokenOwnedEscrow(context, maybeAccount);
}

export async function safeFetchTokenOwnedEscrow(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKey: PublicKey,
  options?: RpcGetAccountOptions
): Promise<TokenOwnedEscrow | null> {
  const maybeAccount = await context.rpc.getAccount(publicKey, options);
  return maybeAccount.exists
    ? deserializeTokenOwnedEscrow(context, maybeAccount)
    : null;
}

export async function fetchAllTokenOwnedEscrow(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKeys: PublicKey[],
  options?: RpcGetAccountsOptions
): Promise<TokenOwnedEscrow[]> {
  const maybeAccounts = await context.rpc.getAccounts(publicKeys, options);
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'TokenOwnedEscrow');
    return deserializeTokenOwnedEscrow(context, maybeAccount);
  });
}

export async function safeFetchAllTokenOwnedEscrow(
  context: Pick<Context, 'rpc' | 'serializer'>,
  publicKeys: PublicKey[],
  options?: RpcGetAccountsOptions
): Promise<TokenOwnedEscrow[]> {
  const maybeAccounts = await context.rpc.getAccounts(publicKeys, options);
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) =>
      deserializeTokenOwnedEscrow(context, maybeAccount as RpcAccount)
    );
}

export function getTokenOwnedEscrowGpaBuilder(
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>
) {
  const s = context.serializer;
  const programId = context.programs.getPublicKey(
    'mplTokenMetadata',
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      key: KeyArgs;
      baseToken: PublicKey;
      authority: EscrowAuthorityArgs;
      bump: number;
    }>({
      key: [0, getKeySerializer(context)],
      baseToken: [1, s.publicKey()],
      authority: [33, getEscrowAuthoritySerializer(context)],
      bump: [null, s.u8()],
    })
    .deserializeUsing<TokenOwnedEscrow>((account) =>
      deserializeTokenOwnedEscrow(context, account)
    )
    .whereField('key', Key.TokenOwnedEscrow);
}
