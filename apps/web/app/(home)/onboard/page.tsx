import { auth, currentUser } from "@clerk/nextjs/app-beta";
import Head from "next/head";
import CodeView from "./code";
import { pscale } from "../../../utils";
import StripeCheckout from "./stripeCheckout";
import { Suspense } from "react";
import { User } from "@clerk/nextjs/dist/api";

export default async function Page() {
  const user = await currentUser();
  if (user?.id) {
    const data = await getUserAPIKey(user);
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

async function getUserAPIKey(user: User) {
  // check if userId is in the database as externalId
  // if not, create a new user
  // if so, return the user
  const userId = user.id;
  const userTableResult = await pscale
    .execute("SELECT * FROM User WHERE externalId = ?", [user.id])

    .catch((e) => {
      console.log(e);
    });
  if (!userTableResult || userTableResult.rows.length === 0) {
    // insert user into database including externalId, email, and first name and last name
    // also insert api Token with field active set to true
    await pscale
      .execute(
        "INSERT IGNORE INTO User (externalId, email, firstName, lastName) VALUES (?, ?, ?, ?) ",
        [
          user.id,
          user!.emailAddresses[0].emailAddress,
          user!.firstName,
          user!.lastName,
        ]
      )
      .catch((e) => {
        console.log(e);
      });

    // generate a new externalKey for our api
    const apiKey = generateExternalApiToken(
      user!.emailAddresses[0].emailAddress
    );
    await pscale.execute(
      "INSERT INTO Token (userExternalId, active, nftInfoCallsLimit, mintCallsLimit, canMint, type, externalKey) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, true, 1000, 25, true, "API", apiKey]
    );

    return {
      userId,
      isNew: true,
      apiKey,
    };
  }
  let tokensRes = await pscale.execute(
    "SELECT * FROM Token WHERE userExternalId = ? AND type = ?",
    [userId, "API"]
  );

  if (tokensRes.rows.length === 0) {
    const apiKey = generateExternalApiToken(
      user!.emailAddresses[0].emailAddress
    );

    await pscale.execute(
      "INSERT INTO Token (userExternalId, active, nftInfoCallsLimit, mintCallsLimit, canMint, type, externalKey) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, true, 1000, 25, true, "API", apiKey]
    );

    tokensRes = await pscale.execute(
      "SELECT * FROM Token WHERE userExternalId = ? AND type = ?",
      [userId, "API"]
    );
  }
  const { externalKey } = tokensRes.rows[0] as { externalKey: string };

  // get the user's id from the database
  return { userId, isNew: false, apiKey: externalKey };
}
