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
export type SetTokenStandardInstructionAccounts = {
  /** Metadata account */
  metadata?: PublicKey;
  /** Metadata update authority */
  updateAuthority?: Signer;
  /** Mint account */
  mint: PublicKey;
  /** Edition account */
  edition?: PublicKey;
};

// Arguments.
export type SetTokenStandardInstructionData = { discriminator: number };

export type SetTokenStandardInstructionDataArgs = {};

export function getSetTokenStandardInstructionDataSerializer(
  context: Pick<Context, "serializer">
): Serializer<
  SetTokenStandardInstructionDataArgs,
  SetTokenStandardInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    SetTokenStandardInstructionDataArgs,
    SetTokenStandardInstructionData,
    SetTokenStandardInstructionData
  >(
    s.struct<SetTokenStandardInstructionData>([["discriminator", s.u8()]], {
      description: "SetTokenStandardInstructionData",
    }),
    (value) =>
      ({ ...value, discriminator: 35 } as SetTokenStandardInstructionData)
  ) as Serializer<
    SetTokenStandardInstructionDataArgs,
    SetTokenStandardInstructionData
  >;
}

// Instruction.
export function setTokenStandard(
  context: Pick<Context, "serializer" | "programs" | "eddsa" | "identity">,
  input: SetTokenStandardInstructionAccounts
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    "mplTokenMetadata",
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Resolved accounts.
  const mintAccount = input.mint;
  const metadataAccount =
    input.metadata ??
    findMetadataPda(context, { mint: publicKey(mintAccount) });
  const updateAuthorityAccount = input.updateAuthority ?? context.identity;
  const editionAccount = input.edition;

  // Metadata.
  keys.push({
    pubkey: metadataAccount,
    isSigner: false,
    isWritable: isWritable(metadataAccount, true),
  });

  // Update Authority.
  signers.push(updateAuthorityAccount);
  keys.push({
    pubkey: updateAuthorityAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(updateAuthorityAccount, true),
  });

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, false),
  });

  // Edition (optional).
  if (editionAccount) {
    keys.push({
      pubkey: editionAccount,
      isSigner: false,
      isWritable: isWritable(editionAccount, false),
    });
  }

  // Data.
  const data = getSetTokenStandardInstructionDataSerializer(context).serialize(
    {}
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
