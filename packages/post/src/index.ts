const func = async function post(
  url: string,
  data?: any,
  authorization?: string
) {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization || "",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
};
export { func };
export default func;
