import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { connect } from "@planetscale/database";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/cjs/styles/hljs";
export default function Onboard(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
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
            {props.apiKey}
          </p>
          <h1 className="text-lg font-bold mt-2">Install our npm package</h1>
          <div className="mt-4">
            <SyntaxHighlighter
              language="bash"
              style={docco}
              customStyle={{
                borderRadius: "10px",
              }}
            >
              {`npm install mintee-nft`}
            </SyntaxHighlighter>
          </div>
          <h1 className="text-lg font-bold mt-2">Mint your first NFT</h1>
          <div className="mt-4">
            <SyntaxHighlighter
              language="typescipt"
              style={docco}
              customStyle={{
                borderRadius: "10px",
              }}
            >
              {`import { Mintee } from "mintee-nft"

async function mintNFT() {
  // initialize mintee with your api key
  const mintee = Mintee.make({
  apiKey: "${props.apiKey}"});

  // mint nft 
  return await mintee.mintNft({ name: "test_nft", symbol: "test" });
)} `}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
const psConfig = {
  host: "aws.connect.psdb.cloud",
  username: "g3s67laml1b4smxqc239",
  password: "pscale_pw_RdHk3l4bhvrREUaPkIykgVoRBdJGJLgQp5frEdNi82i",
};

const conn = connect(psConfig);

function generateExternalApiToken(email: string) {
  const timestamp = Date.now().toString();
  return Buffer.from(`${email}:${timestamp}`).toString("base64");
}

export const getServerSideProps: GetServerSideProps<{
  userId: string;
  isNew: boolean;
  apiKey: string;
}> = async (ctx) => {
  const usert = getAuth(ctx.req);
  const userId = usert.userId;
  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // check if userId is in the database as externalId
  // if not, create a new user
  // if so, return the user

  const userTableResult = await conn.execute(
    "SELECT * FROM User WHERE externalId = ?",
    [userId]
  );

  if (userTableResult.rows.length === 0) {
    const user = await clerkClient.users.getUser(userId);
    // insert user into database including externalId, email, and first name and last name
    // also insert api Token with field active set to true
    const [newUser, apiKey] = await conn.transaction(async (trx) => {
      const userInsertResult = await trx.execute(
        "INSERT INTO User (externalId, email, firstName, lastName) VALUES (?, ?, ?, ?)",
        [
          userId,
          user.emailAddresses[0].emailAddress,
          user.firstName,
          user.lastName,
        ]
      );
      // generate a new externalKey for our api
      const apiKey = generateExternalApiToken(
        user.emailAddresses[0].emailAddress
      );
      await trx.execute(
        "INSERT INTO Token (userId, active, nftInfoCallsLimit, mintCallsLimit, canMint, type, externalKey) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userInsertResult.insertId, true, 1000, 25, true, "API", apiKey]
      );
      return [userInsertResult, apiKey];
    });

    return {
      props: {
        userId: newUser.insertId,
        isNew: true,
        apiKey,
      },
    };
  }
  const user = userTableResult.rows[0] as { id: string };
  const tokensRes = await conn.execute(
    "SELECT * FROM Token WHERE userId = ? AND type = ?",
    [user.id, "API"]
  );

  const { externalKey } = tokensRes.rows[0] as { externalKey: string };

  // get the user's id from the database
  return { props: { userId: user.id, isNew: false, apiKey: externalKey } };
};
