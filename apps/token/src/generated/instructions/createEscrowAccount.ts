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
import { findMasterEditionPda, findMetadataPda } from "../accounts";

// Accounts.
export type CreateEscrowAccountInstructionAccounts = {
  /** Escrow account */
  escrow: PublicKey;
  /** Metadata account */
  metadata?: PublicKey;
  /** Mint account */
  mint: PublicKey;
  /** Token account of the token */
  tokenAccount: PublicKey;
  /** Edition account */
  edition?: PublicKey;
  /** Wallet paying for the transaction and new account */
  payer?: Signer;
  /** System program */
  systemProgram?: PublicKey;
  /** Instructions sysvar account */
  sysvarInstructions?: PublicKey;
  /** Authority/creator of the escrow account */
  authority?: Signer;
};

// Arguments.
export type CreateEscrowAccountInstructionData = { discriminator: number };

export type CreateEscrowAccountInstructionDataArgs = {};

export function getCreateEscrowAccountInstructionDataSerializer(
  context: Pick<Context, "serializer">
): Serializer<
  CreateEscrowAccountInstructionDataArgs,
  CreateEscrowAccountInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    CreateEscrowAccountInstructionDataArgs,
    CreateEscrowAccountInstructionData,
    CreateEscrowAccountInstructionData
  >(
    s.struct<CreateEscrowAccountInstructionData>([["discriminator", s.u8()]], {
      description: "CreateEscrowAccountInstructionData",
    }),
    (value) =>
      ({ ...value, discriminator: 38 } as CreateEscrowAccountInstructionData)
  ) as Serializer<
    CreateEscrowAccountInstructionDataArgs,
    CreateEscrowAccountInstructionData
  >;
}

// Instruction.
export function createEscrowAccount(
  context: Pick<Context, "serializer" | "programs" | "eddsa" | "payer">,
  input: CreateEscrowAccountInstructionAccounts
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    "mplTokenMetadata",
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Resolved accounts.
  const escrowAccount = input.escrow;
  const mintAccount = input.mint;
  const metadataAccount =
    input.metadata ??
    findMetadataPda(context, { mint: publicKey(mintAccount) });
  const tokenAccountAccount = input.tokenAccount;
  const editionAccount =
    input.edition ??
    findMasterEditionPda(context, { mint: publicKey(mintAccount) });
  const payerAccount = input.payer ?? context.payer;
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
  const authorityAccount = input.authority;

  // Escrow.
  keys.push({
    pubkey: escrowAccount,
    isSigner: false,
    isWritable: isWritable(escrowAccount, true),
  });

  // Metadata.
  keys.push({
    pubkey: metadataAccount,
    isSigner: false,
    isWritable: isWritable(metadataAccount, true),
  });

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, false),
  });

  // Token Account.
  keys.push({
    pubkey: tokenAccountAccount,
    isSigner: false,
    isWritable: isWritable(tokenAccountAccount, false),
  });

  // Edition.
  keys.push({
    pubkey: editionAccount,
    isSigner: false,
    isWritable: isWritable(editionAccount, false),
  });

  // Payer.
  signers.push(payerAccount);
  keys.push({
    pubkey: payerAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(payerAccount, true),
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

  // Authority (optional).
  if (authorityAccount) {
    signers.push(authorityAccount);
    keys.push({
      pubkey: authorityAccount.publicKey,
      isSigner: true,
      isWritable: isWritable(authorityAccount, false),
    });
  }

  // Data.
  const data = getCreateEscrowAccountInstructionDataSerializer(
    context
  ).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
