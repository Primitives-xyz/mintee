import { auth } from "@clerk/nextjs/app-beta";
import { prismaModels } from "mintee-database";
import { pscale } from "../../../../utils";
export const revalidate = 0.5;
async function getTokens() {
  const { userId } = auth();
  const tokens = await pscale.execute(
    "SELECT * FROM Token WHERE userExternalId = ?",
    [userId]
  );
  return tokens.rows as prismaModels.Token[];
}

export default async function ApiKeysView() {
  const tokens = await getTokens();
  return (
    <>
      <h2 className="text-2xl min-w-full shadow-md bg-[#111C27]/75 p-2 rounded-lg">
        API Tokens
      </h2>
      {tokens.map((token) => (
        <div key={token.id}>{token.externalKey}</div>
      ))}
    </>
  );
}
