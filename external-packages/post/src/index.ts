/**
 * post is a semi-type-safe wrapper around fetch that makes it easier to make
 * POST requests.
 * The full url  is the only required parameter.
 * @param url
 * Data can be a string, object, or undefined. If you pass in an object, it will have to be
 * accompanied by a type. We expect you to pass in a stringiefied json object for body.
 * If you pass in undefined, it will just call post on the url.
 * @param data
 * Headers are optional. Pass in array of records like {"Authorization": "Bearer {token}"}
 * @param headers
 * @returns
 */
async function post<BodyDataType>(
  url: string,
  data?: string | BodyDataType,
  headers: HeadersInit = []
) {
  headers = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (!data) {
    return await fetch(url, {
      method: "POST",
    });
  }
  if (typeof data === "string") {
    return await fetch(url, {
      method: "POST",
      headers,
      body: data,
    });
  }
  return await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });
}
export { post };
export default post;
