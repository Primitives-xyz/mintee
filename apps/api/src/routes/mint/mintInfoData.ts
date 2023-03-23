import { corsHeaders } from "../../utils";

export async function mintInfoData(request: Request) {
  // try to grab body
  const json = await request.json().catch((e) => {
    console.log("Error parsing json", e);
  });

  if (!json) {
    throw new Error("Error parsing body pal!");
    //@ts-ignore
  } else if (!json.data) {
    throw new Error("data is required");
  }
  return json as { data: any; options: any };
}
