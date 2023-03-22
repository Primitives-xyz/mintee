import { auth } from "@clerk/nextjs/app-beta";
import { prismaModels } from "mintee-database";
import { pscale } from "../../../../utils";
import ApiKeyViewInfo from "./apiKeyView";
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
      <div className="flex flex-col">
        <div className="flex flex-row space-x-2 m-2 w-full items-center justify-start">
          <div className=" rounded-md bg-slate-700 flex justify-center  items-center flex-col">
            <div className="text-lg">
              {tokens.length > 0 &&
                tokens.map((token, index) => (
                  <div className="m-2 flex flex-row" key={token.id}>
                    <div className="font-bold min-h-full w-12  flex justify-center items-center">
                      <span>{index + 1 + ":"}</span>
                    </div>

                    <ApiKeyViewInfo apiKey={token.externalKey ?? ""} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
