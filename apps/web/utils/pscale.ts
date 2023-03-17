import { connect } from "@planetscale/database";

export const psConfig = {
  host: "aws.connect.psdb.cloud",
  username: "g3s67laml1b4smxqc239",
  password: "pscale_pw_RdHk3l4bhvrREUaPkIykgVoRBdJGJLgQp5frEdNi82i",
};

export const pscale = connect(psConfig);
