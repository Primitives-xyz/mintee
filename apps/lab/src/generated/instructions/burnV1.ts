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
} from "@metaplex-foundation/umi";
import { findMetadataPda } from "../accounts";

// Accounts.
export type BurnV1InstructionAccounts = {
  /** Asset owner or Utility delegate */
  authority?: Signer;
  /** Metadata of the Collection */
  collectionMetadata?: PublicKey;
  /** Metadata (pda of ['metadata', program id, mint id]) */
  metadata?: PublicKey;
  /** Edition of the asset */
  edition?: PublicKey;
  /** Mint of token asset */
  mint: PublicKey;
  /** Token account to close */
  token: PublicKey;
  /** Master edition account */
  masterEdition?: PublicKey;
  /** Master edition mint of the asset */
  masterEditionMint?: PublicKey;
  /** Master edition token account */
  masterEditionToken?: PublicKey;
  /** Edition marker account */
  editionMarker?: PublicKey;
  /** Token record account */
  tokenRecord?: PublicKey;
  /** System program */
  systemProgram?: PublicKey;
  /** Instructions sysvar account */
  sysvarInstructions?: PublicKey;
  /** SPL Token Program */
  splTokenProgram?: PublicKey;
};

// Arguments.
export type BurnV1InstructionData = {
  discriminator: number;
  burnV1Discriminator: number;
  amount: bigint;
};

export type BurnV1InstructionDataArgs = { amount: number | bigint };

export function getBurnV1InstructionDataSerializer(
  context: Pick<Context, "serializer">
): Serializer<BurnV1InstructionDataArgs, BurnV1InstructionData> {
  const s = context.serializer;
  return mapSerializer<
    BurnV1InstructionDataArgs,
    BurnV1InstructionData,
    BurnV1InstructionData
  >(
    s.struct<BurnV1InstructionData>(
      [
        ["discriminator", s.u8()],
        ["burnV1Discriminator", s.u8()],
        ["amount", s.u64()],
      ],
      { description: "BurnV1InstructionData" }
    ),
    (value) =>
      ({
        ...value,
        discriminator: 41,
        burnV1Discriminator: 0,
      } as BurnV1InstructionData)
  ) as Serializer<BurnV1InstructionDataArgs, BurnV1InstructionData>;
}

// Instruction.
export function burnV1(
  context: Pick<Context, "serializer" | "programs" | "eddsa" | "identity">,
  input: BurnV1InstructionAccounts & BurnV1InstructionDataArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    "mplTokenMetadata",
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Resolved accounts.
  const authorityAccount = input.authority ?? context.identity;
  const collectionMetadataAccount = input.collectionMetadata ?? {
    ...programId,
    isWritable: false,
  };
  const mintAccount = input.mint;
  const metadataAccount =
    input.metadata ??
    findMetadataPda(context, { mint: publicKey(mintAccount) });
  const editionAccount = input.edition ?? { ...programId, isWritable: false };
  const tokenAccount = input.token;
  const masterEditionAccount = input.masterEdition ?? {
    ...programId,
    isWritable: false,
  };
  const masterEditionMintAccount = input.masterEditionMint ?? {
    ...programId,
    isWritable: false,
  };
  const masterEditionTokenAccount = input.masterEditionToken ?? {
    ...programId,
    isWritable: false,
  };
  const editionMarkerAccount = input.editionMarker ?? {
    ...programId,
    isWritable: false,
  };
  const tokenRecordAccount = input.tokenRecord ?? {
    ...programId,
    isWritable: false,
  };
  const systemProgramAccount = input.systemProgram ?? {
    ...context.programs.getPublicKey(
      "splSystem",
      "11111111111111111111111111111111"
    ),
    isWritable: false,
  };
  const sysvarInstructionsAccount =
    input.sysvarInstructions ??
    publicKey("Sysvar1nstructions1111111111111111111111111");
  const splTokenProgramAccount = input.splTokenProgram ?? {
    ...context.programs.getPublicKey(
      "splToken",
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    ),
    isWritable: false,
  };

  // Authority.
  signers.push(authorityAccount);
  keys.push({
    pubkey: authorityAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(authorityAccount, true),
  });

  // Collection Metadata.
  keys.push({
    pubkey: collectionMetadataAccount,
    isSigner: false,
    isWritable: isWritable(collectionMetadataAccount, true),
  });

  // Metadata.
  keys.push({
    pubkey: metadataAccount,
    isSigner: false,
    isWritable: isWritable(metadataAccount, true),
  });

  // Edition.
  keys.push({
    pubkey: editionAccount,
    isSigner: false,
    isWritable: isWritable(editionAccount, true),
  });

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, true),
  });

  // Token.
  keys.push({
    pubkey: tokenAccount,
    isSigner: false,
    isWritable: isWritable(tokenAccount, true),
  });

  // Master Edition.
  keys.push({
    pubkey: masterEditionAccount,
    isSigner: false,
    isWritable: isWritable(masterEditionAccount, true),
  });

  // Master Edition Mint.
  keys.push({
    pubkey: masterEditionMintAccount,
    isSigner: false,
    isWritable: isWritable(masterEditionMintAccount, false),
  });

  // Master Edition Token.
  keys.push({
    pubkey: masterEditionTokenAccount,
    isSigner: false,
    isWritable: isWritable(masterEditionTokenAccount, false),
  });

  // Edition Marker.
  keys.push({
    pubkey: editionMarkerAccount,
    isSigner: false,
    isWritable: isWritable(editionMarkerAccount, true),
  });

  // Token Record.
  keys.push({
    pubkey: tokenRecordAccount,
    isSigner: false,
    isWritable: isWritable(tokenRecordAccount, true),
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

  // Spl Token Program.
  keys.push({
    pubkey: splTokenProgramAccount,
    isSigner: false,
    isWritable: isWritable(splTokenProgramAccount, false),
  });

  // Data.
  const data = getBurnV1InstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}