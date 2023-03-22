import { auth } from "@clerk/nextjs/app-beta";
import Link from "next/link";
import { pscale } from "../../../utils";

async function updateUserTokens() {
  const { userId } = auth();
  await pscale
    .execute(
      `UPDATE Token t
        JOIN User u ON t.userExternalId = u.externalId
        SET t.planType = 'PRO', u.planType = 'PRO'
        WHERE u.externalId = ?;`,
      [userId]
    )
    .catch((e) => {
      console.log("UPDATE ERROR", e);
    });
}

export default async function Page(props: any) {
  await updateUserTokens();

  //    else if (userId != props.searchParams.userId) {
  //     return (
  //       <div>
  //         Something has gone wrong, but do not worry the correct account got
  //         upgraded
  //       </div>
  //     );
  //   }

  return (
    <div className="w-full h-96 flex justify-center items-center text-3xl flex-col space-y-4">
      <div>Thank you for upgrading to the pro version of Mintee.</div>
      <div>We would love to hear your feedback! feedback@mintee.io</div>
      <Link
        className="bg-gray-500 rounded-xl text-white font-medium text-xl text-center  w-52 px-4 py-3 sm:mt-10 mt-8 hover:bg-gray-400 transition"
        href="https://docs.mintee.io"
      >
        Read our docs
      </Link>
      <Link
        className="bg-yellow-400 rounded-xl text-white font-medium text-xl text-center  w-52 px-4 py-3 sm:mt-10 mt-8 hover:bg-yellow-300 transition"
        href="https://mintee.io/dashboard"
      >
        View usage
      </Link>
    </div>
  );
}
