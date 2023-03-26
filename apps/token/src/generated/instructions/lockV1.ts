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
  Option,
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
import {
  AuthorizationData,
  AuthorizationDataArgs,
  getAuthorizationDataSerializer,
} from "../types";

// Accounts.
export type LockV1InstructionAccounts = {
  /** Delegate or freeze authority */
  authority?: Signer;
  /** Token owner account */
  tokenOwner?: PublicKey;
  /** Token account */
  token: PublicKey;
  /** Mint account */
  mint: PublicKey;
  /** Metadata account */
  metadata?: PublicKey;
  /** Edition account */
  edition?: PublicKey;
  /** Token record account */
  tokenRecord?: PublicKey;
  /** Payer */
  payer?: Signer;
  /** System program */
  systemProgram?: PublicKey;
  /** System program */
  sysvarInstructions?: PublicKey;
  /** SPL Token Program */
  splTokenProgram?: PublicKey;
  /** Token Authorization Rules Program */
  authorizationRulesProgram?: PublicKey;
  /** Token Authorization Rules account */
  authorizationRules?: PublicKey;
};

// Arguments.
export type LockV1InstructionData = {
  discriminator: number;
  lockV1Discriminator: number;
  authorizationData: Option<AuthorizationData>;
};

export type LockV1InstructionDataArgs = {
  authorizationData: Option<AuthorizationDataArgs>;
};

export function getLockV1InstructionDataSerializer(
  context: Pick<Context, "serializer">
): Serializer<LockV1InstructionDataArgs, LockV1InstructionData> {
  const s = context.serializer;
  return mapSerializer<
    LockV1InstructionDataArgs,
    LockV1InstructionData,
    LockV1InstructionData
  >(
    s.struct<LockV1InstructionData>(
      [
        ["discriminator", s.u8()],
        ["lockV1Discriminator", s.u8()],
        [
          "authorizationData",
          s.option(getAuthorizationDataSerializer(context)),
        ],
      ],
      { description: "LockV1InstructionData" }
    ),
    (value) =>
      ({
        ...value,
        discriminator: 46,
        lockV1Discriminator: 0,
      } as LockV1InstructionData)
  ) as Serializer<LockV1InstructionDataArgs, LockV1InstructionData>;
}

// Instruction.
export function lockV1(
  context: Pick<
    Context,
    "serializer" | "programs" | "eddsa" | "identity" | "payer"
  >,
  input: LockV1InstructionAccounts & LockV1InstructionDataArgs
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
  const tokenOwnerAccount = input.tokenOwner ?? {
    ...programId,
    isWritable: false,
  };
  const tokenAccount = input.token;
  const mintAccount = input.mint;
  const metadataAccount =
    input.metadata ??
    findMetadataPda(context, { mint: publicKey(mintAccount) });
  const editionAccount = input.edition ?? { ...programId, isWritable: false };
  const tokenRecordAccount = input.tokenRecord ?? {
    ...programId,
    isWritable: false,
  };
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
  const splTokenProgramAccount = input.splTokenProgram ?? {
    ...programId,
    isWritable: false,
  };
  const authorizationRulesProgramAccount = input.authorizationRulesProgram ?? {
    ...programId,
    isWritable: false,
  };
  const authorizationRulesAccount = input.authorizationRules ?? {
    ...programId,
    isWritable: false,
  };

  // Authority.
  signers.push(authorityAccount);
  keys.push({
    pubkey: authorityAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(authorityAccount, false),
  });

  // Token Owner.
  keys.push({
    pubkey: tokenOwnerAccount,
    isSigner: false,
    isWritable: isWritable(tokenOwnerAccount, false),
  });

  // Token.
  keys.push({
    pubkey: tokenAccount,
    isSigner: false,
    isWritable: isWritable(tokenAccount, true),
  });

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, false),
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
    isWritable: isWritable(editionAccount, false),
  });

  // Token Record.
  keys.push({
    pubkey: tokenRecordAccount,
    isSigner: false,
    isWritable: isWritable(tokenRecordAccount, true),
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

  // Spl Token Program.
  keys.push({
    pubkey: splTokenProgramAccount,
    isSigner: false,
    isWritable: isWritable(splTokenProgramAccount, false),
  });

  // Authorization Rules Program.
  keys.push({
    pubkey: authorizationRulesProgramAccount,
    isSigner: false,
    isWritable: isWritable(authorizationRulesProgramAccount, false),
  });

  // Authorization Rules.
  keys.push({
    pubkey: authorizationRulesAccount,
    isSigner: false,
    isWritable: isWritable(authorizationRulesAccount, false),
  });

  // Data.
  const data = getLockV1InstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
