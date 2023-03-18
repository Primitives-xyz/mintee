import { auth, currentUser } from "@clerk/nextjs/app-beta";
import Head from "next/head";
import CodeView from "./code";
import { pscale } from "../../../utils";
import StripeCheckout from "./stripeCheckout";

export default async function Page() {
  const { userId } = auth();
  if (userId) {
    const data = await getUserAPIKey(userId);
    return (
      <div className="">
        <Head>
          <title>Mintee</title>
        </Head>

        <div>
          <div className="flex flex-col items-center justify-center  mt-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold">Welcome to Mintee!</h1>
            <h2 className="mt-4">Your api key:</h2>
            <p className="text-xl bg-slate-500/50 p-2 rounded-2xl">
              {data.apiKey}
            </p>
            <h1 className="text-lg font-bold mt-2">Install our npm package</h1>
            <CodeView apiKey={data.apiKey} />
            <StripeCheckout />
          </div>
        </div>
      </div>
    );
  }
}

function generateExternalApiToken(email: string) {
  const timestamp = Date.now().toString();
  // remove equal signs
  return Buffer.from(`${email}:${timestamp}`)
    .toString("base64")
    .replace(/=/g, "");
}

async function getUserAPIKey(userId: string) {
  // check if userId is in the database as externalId
  // if not, create a new user
  // if so, return the user

  const userTableResult = await pscale
    .execute("SELECT * FROM User WHERE externalId = ?", [userId])
    .catch((e) => {
      console.log(e);
    });

  if (!userTableResult || userTableResult.rows.length === 0) {
    const user = await currentUser();

    // insert user into database including externalId, email, and first name and last name
    // also insert api Token with field active set to true

    await pscale.execute(
      "INSERT INTO User (externalId, email, firstName, lastName) VALUES (?, ?, ?, ?)",
      [
        userId,
        user!.emailAddresses[0].emailAddress,
        user!.firstName,
        user!.lastName,
      ]
    );

    // generate a new externalKey for our api
    const apiKey = generateExternalApiToken(
      user!.emailAddresses[0].emailAddress
    );
    await pscale.execute(
      "INSERT INTO Token (userExternalId, active, nftInfoCallsLimit, mintCallsLimit, canMint, type, externalKey) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, true, 1000, 25, true, "API", apiKey]
    );

    return {
      props: {
        userId,
        isNew: true,
        apiKey,
      },
    };
  }
  const user = userTableResult.rows[0] as { id: string };
  const tokensRes = await pscale.execute(
    "SELECT * FROM Token WHERE userExternalId = ? AND type = ?",
    [userId, "API"]
  );

  const { externalKey } = tokensRes.rows[0] as { externalKey: string };

  // get the user's id from the database
  return { userId: user.id, isNew: false, apiKey: externalKey };
}
