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
export type ThawDelegatedAccountInstructionAccounts = {
  /** Delegate */
  delegate: Signer;
  /** Token account to thaw */
  tokenAccount: PublicKey;
  /** Edition */
  edition?: PublicKey;
  /** Token mint */
  mint: PublicKey;
  /** Token Program */
  tokenProgram?: PublicKey;
};

// Arguments.
export type ThawDelegatedAccountInstructionData = { discriminator: number };

export type ThawDelegatedAccountInstructionDataArgs = {};

export function getThawDelegatedAccountInstructionDataSerializer(
  context: Pick<Context, "serializer">
): Serializer<
  ThawDelegatedAccountInstructionDataArgs,
  ThawDelegatedAccountInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    ThawDelegatedAccountInstructionDataArgs,
    ThawDelegatedAccountInstructionData,
    ThawDelegatedAccountInstructionData
  >(
    s.struct<ThawDelegatedAccountInstructionData>([["discriminator", s.u8()]], {
      description: "ThawDelegatedAccountInstructionData",
    }),
    (value) =>
      ({ ...value, discriminator: 27 } as ThawDelegatedAccountInstructionData)
  ) as Serializer<
    ThawDelegatedAccountInstructionDataArgs,
    ThawDelegatedAccountInstructionData
  >;
}

// Instruction.
export function thawDelegatedAccount(
  context: Pick<Context, "serializer" | "programs" | "eddsa">,
  input: ThawDelegatedAccountInstructionAccounts
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
  const data = getThawDelegatedAccountInstructionDataSerializer(
    context
  ).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}