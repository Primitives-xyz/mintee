# Post

Post is a TypeScript library that provides a convenient and type-safe way to make HTTP POST requests, modeled after the web API fetch function. It simplifies the process of making HTTP POST requests by providing a single function with an easy-to-use API.

```typescript
type userType = {
  name: string;
  email: string;
};
async function createUserWithPost(user: userType) {
  const url = "https://example.com/api/users";

  // Using Post
  const response = await post<userType>(url, user);

  // vs using fetch
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  };
}
```

## Installation

Post can be installed via npm or yarn:

```shell
npm install @noxford1/post
```

## To use Post, simply import it into your TypeScript file and call the **post()** function with the desired parameters.

Here is an example of how to use Post to make a POST request with JSON data:

```typescript
import { post } from "@noxford1/post";

interface User {
  name: string;
  email: string;
}

async function createUser(user: User) {
  const url = "https://example.com/api/users";
  const response = await post<User>(url, user);

  if (response.ok) {
    const data = await response.json();
    console.log("User created:", data);
  } else {
    console.error("Failed to create user:", response.status);
  }
}
```

In this example, we define a **`User`** interface, which is used to provide type information to the **`post()`** function. We then call **`post()`** with the URL and data for the request. The **`<User>`** type parameter tells Post to expect JSON data with a shape that matches the User interface. Finally, we handle the response, checking whether it was successful and logging the result to the console.

By default, the **Content-Type** header is set to **application/json**.

API
The **`post()`** function takes the following parameters:

**url: string:** The URL to which the request should be sent.
**data?: string | BodyDataType:** The data to send with the request. This can be a string, a JSON-serializable object, or undefined.
**headers?: HeadersInit:** An optional set of headers to include in the request. This should be an array of records like {"Authorization": "Bearer {token}"}.
The **`post()`** function returns a Promise that resolves to a Response object.

License
Post is licensed under the ISC License. See the LICENSE file for details.
