import type { NextApiRequest, NextApiResponse } from "next";
import { connect } from "@planetscale/database";
import { NextResponse } from "next/server";
export const config = {
  runtime: "edge", // this is a pre-requisite
};
export type GenerateResponseData = {
  isOnboarded: string;
};

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    userId: string;
  };
}

const psConfig = {
  host: "aws.connect.psdb.cloud",
  username: "x143hu7y1b6v60ux253l",
  password: "pscale_pw_lZ5GiWGI9n8DGbyPC6HtHCkk22m2vrwDKrVdHbAHuTc",
};

const conn = connect(psConfig);

/**
 * Checks if the user is onboard
 * @param req
 * @param res
 * @returns
 * True if new, false if not
 */
export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<GenerateResponseData>
) {
  console.log("body", req.body);
  const { userId } = req.body;

  NextResponse.json({ isOnboarded: "true" });
}
