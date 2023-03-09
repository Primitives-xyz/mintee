export default function post(
  url: string,
  data?: BodyInit | null | undefined,
  authorization?: string
) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization || "",
    },
    body: data ? JSON.stringify(data) : undefined,
  }).catch((e) => {
    throw new Error(e);
  });
}
