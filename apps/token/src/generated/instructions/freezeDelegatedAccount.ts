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
import { findMasterEditionPda } from "../accounts";

// Accounts.
export type FreezeDelegatedAccountInstructionAccounts = {
  /** Delegate */
  delegate: Signer;
  /** Token account to freeze */
  tokenAccount: PublicKey;
  /** Edition */
  edition?: PublicKey;
  /** Token mint */
  mint: PublicKey;
  /** Token Program */
  tokenProgram?: PublicKey;
};

// Arguments.
export type FreezeDelegatedAccountInstructionData = { discriminator: number };

export type FreezeDelegatedAccountInstructionDataArgs = {};

export function getFreezeDelegatedAccountInstructionDataSerializer(
  context: Pick<Context, "serializer">
): Serializer<
  FreezeDelegatedAccountInstructionDataArgs,
  FreezeDelegatedAccountInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    FreezeDelegatedAccountInstructionDataArgs,
    FreezeDelegatedAccountInstructionData,
    FreezeDelegatedAccountInstructionData
  >(
    s.struct<FreezeDelegatedAccountInstructionData>(
      [["discriminator", s.u8()]],
      { description: "FreezeDelegatedAccountInstructionData" }
    ),
    (value) =>
      ({ ...value, discriminator: 26 } as FreezeDelegatedAccountInstructionData)
  ) as Serializer<
    FreezeDelegatedAccountInstructionDataArgs,
    FreezeDelegatedAccountInstructionData
  >;
}

// Instruction.
export function freezeDelegatedAccount(
  context: Pick<Context, "serializer" | "programs" | "eddsa">,
  input: FreezeDelegatedAccountInstructionAccounts
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    "mplTokenMetadata",
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Resolved accounts.
  const delegateAccount = input.delegate;
  const tokenAccountAccount = input.tokenAccount;
  const mintAccount = input.mint;
  const editionAccount =
    input.edition ??
    findMasterEditionPda(context, { mint: publicKey(mintAccount) });
  const tokenProgramAccount = input.tokenProgram ?? {
    ...context.programs.getPublicKey(
      "splToken",
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    ),
    isWritable: false,
  };

  // Delegate.
  signers.push(delegateAccount);
  keys.push({
    pubkey: delegateAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(delegateAccount, true),
  });

  // Token Account.
  keys.push({
    pubkey: tokenAccountAccount,
    isSigner: false,
    isWritable: isWritable(tokenAccountAccount, true),
  });

  // Edition.
  keys.push({
    pubkey: editionAccount,
    isSigner: false,
    isWritable: isWritable(editionAccount, false),
  });

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, false),
  });

  // Token Program.
  keys.push({
    pubkey: tokenProgramAccount,
    isSigner: false,
    isWritable: isWritable(tokenProgramAccount, false),
  });

  // Data.
  const data = getFreezeDelegatedAccountInstructionDataSerializer(
    context
  ).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
