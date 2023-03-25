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

// Accounts.
export type VerifyCreatorV1InstructionAccounts = {
  /** Creator to verify, collection update authority or delegate */
  authority?: Signer;
  /** Delegate record PDA */
  delegateRecord?: PublicKey;
  /** Metadata account */
  metadata: PublicKey;
  /** Mint of the Collection */
  collectionMint?: PublicKey;
  /** Metadata Account of the Collection */
  collectionMetadata?: PublicKey;
  /** Master Edition Account of the Collection Token */
  collectionMasterEdition?: PublicKey;
  /** System program */
  systemProgram?: PublicKey;
  /** Instructions sysvar account */
  sysvarInstructions?: PublicKey;
};

// Arguments.
export type VerifyCreatorV1InstructionData = {
  discriminator: number;
  verifyCreatorV1Discriminator: number;
};

export type VerifyCreatorV1InstructionDataArgs = {};

export function getVerifyCreatorV1InstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  VerifyCreatorV1InstructionDataArgs,
  VerifyCreatorV1InstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    VerifyCreatorV1InstructionDataArgs,
    VerifyCreatorV1InstructionData,
    VerifyCreatorV1InstructionData
  >(
    s.struct<VerifyCreatorV1InstructionData>(
      [
        ['discriminator', s.u8()],
        ['verifyCreatorV1Discriminator', s.u8()],
      ],
      { description: 'VerifyCreatorV1InstructionData' }
    ),
    (value) =>
      ({
        ...value,
        discriminator: 52,
        verifyCreatorV1Discriminator: 0,
      } as VerifyCreatorV1InstructionData)
  ) as Serializer<
    VerifyCreatorV1InstructionDataArgs,
    VerifyCreatorV1InstructionData
  >;
}

// Instruction.
export function verifyCreatorV1(
  context: Pick<Context, 'serializer' | 'programs' | 'identity'>,
  input: VerifyCreatorV1InstructionAccounts
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplTokenMetadata',
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  );

  // Resolved accounts.
  const authorityAccount = input.authority ?? context.identity;
  const delegateRecordAccount = input.delegateRecord ?? {
    ...programId,
    isWritable: false,
  };
  const metadataAccount = input.metadata;
  const collectionMintAccount = input.collectionMint ?? {
    ...programId,
    isWritable: false,
  };
  const collectionMetadataAccount = input.collectionMetadata ?? {
    ...programId,
    isWritable: false,
  };
  const collectionMasterEditionAccount = input.collectionMasterEdition ?? {
    ...programId,
    isWritable: false,
  };
  const systemProgramAccount = input.systemProgram ?? {
    ...context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    ),
    isWritable: false,
  };
  const sysvarInstructionsAccount =
    input.sysvarInstructions ??
    publicKey('Sysvar1nstructions1111111111111111111111111');

  // Authority.
  signers.push(authorityAccount);
  keys.push({
    pubkey: authorityAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(authorityAccount, false),
  });

  // Delegate Record.
  keys.push({
    pubkey: delegateRecordAccount,
    isSigner: false,
    isWritable: isWritable(delegateRecordAccount, false),
  });

  // Metadata.
  keys.push({
    pubkey: metadataAccount,
    isSigner: false,
    isWritable: isWritable(metadataAccount, true),
  });

  // Collection Mint.
  keys.push({
    pubkey: collectionMintAccount,
    isSigner: false,
    isWritable: isWritable(collectionMintAccount, false),
  });

  // Collection Metadata.
  keys.push({
    pubkey: collectionMetadataAccount,
    isSigner: false,
    isWritable: isWritable(collectionMetadataAccount, true),
  });

  // Collection Master Edition.
  keys.push({
    pubkey: collectionMasterEditionAccount,
    isSigner: false,
    isWritable: isWritable(collectionMasterEditionAccount, false),
  });

  // System Program.
  keys.push({
    pubkey: systemProgramAccount,
    isSigner: false,
    isWritable: isWritable(systemProgramAccount, false),
  });

  // Sysvar Instructions.
  keys.push({
    pubkey: sysvarInstructionsAccount,
    isSigner: false,
    isWritable: isWritable(sysvarInstructionsAccount, false),
  });

  // Data.
  const data = getVerifyCreatorV1InstructionDataSerializer(context).serialize(
    {}
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
