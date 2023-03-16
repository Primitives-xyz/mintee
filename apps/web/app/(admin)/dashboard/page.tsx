import { Suspense } from "react";
import Loading from "./loading";

async function getPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();
  return posts;
}

export default async function Page() {
  // Fetch data directly in a Server Component
  const recentPosts = await getPosts();
  // Forward fetched data to your Client Component
  return (
    <>
      <Suspense fallback={<Loading />}>
        {recentPosts.map(
          (post: {
            userId: number;
            id: number;
            title: string;
            body: string;
          }) => (
            <div key={post.id}>
              <h1>{post.title}</h1>
              <p>{post.body}</p>
            </div>
          )
        )}
      </Suspense>
    </>
  );
}
