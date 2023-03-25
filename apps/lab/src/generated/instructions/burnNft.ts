/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  AccountMeta,
  Context,
  PublicKey,
  Serializer,
  Signer,
  TransactionBuilder,
  checkForIsWritableOverride as isWritable,
  mapSerializer,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { findMetadataPda } from '../accounts';

// Accounts.
export type BurnNftInstructionAccounts = {
  /** Metadata (pda of ['metadata', program id, mint id]) */
  metadata?: PublicKey;
  /** NFT owner */
  owner: Signer;
  /** Mint of the NFT */
  mint: PublicKey;
  /** Token account to close */
  tokenAccount: PublicKey;
  /** MasterEdition2 of the NFT */
  masterEditionAccount: PublicKey;
  /** SPL Token Program */
  splTokenProgram?: PublicKey;
  /** Metadata of the Collection */
  collectionMetadata?: PublicKey;
};

// Arguments.
export type BurnNftInstructionData = { discriminator: number };

export type BurnNftInstructionDataArgs = {};

export function getBurnNftInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<BurnNftInstructionDataArgs, BurnNftInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    BurnNftInstructionDataArgs,
    BurnNftInstructionData,
    BurnNftInstructionData
  >(
    s.struct<BurnNftInstructionData>([['discriminator', s.u8()]], {
      description: 'BurnNftInstructionData',
    }),
    (value) => ({ ...value, discriminator: 29 } as BurnNftInstructionData)
  ) as Serializer<BurnNftInstructionDataArgs, BurnNftInstructionData>;
}

// Instruction.
export function burnNft(
  context: Pick<Context, 'serializer' | 'programs' | 'eddsa'>,
  input: BurnNftInstructionAccounts
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplTokenMetadata',
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  );

  // Resolved accounts.
  const mintAccount = input.mint;
  const metadataAccount =
    input.metadata ??
    findMetadataPda(context, { mint: publicKey(mintAccount) });
  const ownerAccount = input.owner;
  const tokenAccountAccount = input.tokenAccount;
  const masterEditionAccountAccount = input.masterEditionAccount;
  const splTokenProgramAccount = input.splTokenProgram ?? {
    ...context.programs.getPublicKey(
      'splToken',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    ),
    isWritable: false,
  };
  const collectionMetadataAccount = input.collectionMetadata;

  // Metadata.
  keys.push({
    pubkey: metadataAccount,
    isSigner: false,
    isWritable: isWritable(metadataAccount, true),
  });

  // Owner.
  signers.push(ownerAccount);
  keys.push({
    pubkey: ownerAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(ownerAccount, true),
  });

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, true),
  });

  // Token Account.
  keys.push({
    pubkey: tokenAccountAccount,
    isSigner: false,
    isWritable: isWritable(tokenAccountAccount, true),
  });

  // Master Edition Account.
  keys.push({
    pubkey: masterEditionAccountAccount,
    isSigner: false,
    isWritable: isWritable(masterEditionAccountAccount, true),
  });

  // Spl Token Program.
  keys.push({
    pubkey: splTokenProgramAccount,
    isSigner: false,
    isWritable: isWritable(splTokenProgramAccount, false),
  });

  // Collection Metadata (optional).
  if (collectionMetadataAccount) {
    keys.push({
      pubkey: collectionMetadataAccount,
      isSigner: false,
      isWritable: isWritable(collectionMetadataAccount, true),
    });
  }

  // Data.
  const data = getBurnNftInstructionDataSerializer(context).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
