import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { connect } from "@planetscale/database";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const config = {
  runtime: "experimental-edge",
};
export const getServerSideProps: GetServerSideProps<{
  userId: string;
  isNew: boolean;
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
  const psConfig = {
    host: "aws.connect.psdb.cloud",
    username: "yfgnb57g8feo7sh7yb8q",
    password: "pscale_pw_YyixwuZiYxIGFapRolNyJjI4H2nR4pLSym1HhA1ZE2S",
  };

  const conn = connect(psConfig);
  const userTableResult = await conn.execute(
    "SELECT * FROM User WHERE externalId = ?",
    [userId]
  );

  if (userTableResult.rows.length === 0) {
    const user = await clerkClient.users.getUser(userId);
    // insert user into database including externalId, email, and first name and last name
    // also insert api Token with field active set to true
    const newUser = await conn.transaction(async (trx) => {
      const userInsertResult = await trx.execute(
        "INSERT INTO User (externalId, email, firstName, lastName) VALUES (?, ?, ?, ?)",
        [
          userId,
          user.emailAddresses[0].emailAddress,
          user.firstName,
          user.lastName,
        ]
      );

      const apiTokenInsertResult = await trx.execute(
        "INSERT INTO Token (userId, active, nftInfoCallsLimit, mintCallsLimit, canMint, type) VALUES (?, ?, ?, ?, ?, ?)",
        [userInsertResult.insertId, true, 1000, 25, true, "API"]
      );
      return userInsertResult;
    });

    return {
      props: {
        userId: newUser.insertId,
        isNew: true,
      },
    };
  }
  const user = userTableResult.rows[0] as { id: string };
  // get the user's id from the database
  return { props: { userId: user.id, isNew: false } };
};

export default function Onboard(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  console.log(props);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 -mt-20 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Onboard</h1>
    </div>
  );
}
