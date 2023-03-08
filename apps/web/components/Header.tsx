import { useAuth, UserButton } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { GetServerSideProps } from "next";
import Link from "next/link";

export default function Header(props: { userId: string }) {
  return (
    <header className="flex flex-col xs:flex-row justify-between items-center w-full mt-3 border-b pb-7 sm:px-4 px-2 border-gray-500 gap-2">
      <Link href="/" className="flex space-x-2 justify-center items-center">
        <div className="text-2xl">⚡️</div>
        <h1 className="sm:text-3xl text-xl font-bold ml-2 tracking-tight">
          Mintee
        </h1>
      </Link>
      <div className="flex space-x-2">
        {!props.userId ? (
          <>
            <a
              className="flex max-w-fit items-center justify-center  rounded-full border border-blue-600 text-white px-5 py-2 text-sm shadow-md hover:bg-gray-800 font-medium transition"
              href="/sign-in"
            >
              <p>Sign in</p>
            </a>
            <a
              className="flex max-w-fit items-center justify-center  rounded-full border border-blue-600 text-white px-5 py-2 text-sm shadow-md hover:bg-blue-500 bg-blue-600 font-medium transition"
              href="/sign-up"
            >
              <p>Create Account</p>
              <RightArrow />
            </a>
          </>
        ) : (
          <>
            <a
              className="flex max-w-fit items-center justify-center  rounded-full border border-blue-600 text-white px-5 py-2 text-sm shadow-md hover:bg-gray-800 font-medium transition"
              href="/admin"
            >
              <p>View Usage</p>
            </a>
            <a
              className="flex max-w-fit items-center justify-center  rounded-full border border-blue-600 text-white px-5 py-2 text-sm shadow-md hover:bg-blue-500 bg-blue-600 font-medium transition"
              href="/docs"
            >
              <p>Upgrade</p>
              <RightArrow />
            </a>
          </>
        )}
        <div className="flex justify-center items-center">
          {props.userId && <UserButton />}
        </div>
      </div>
    </header>
  );
}

function RightArrow({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 16 16"
      className={className}
    >
      <path d="M9.58579 8.7071C9.97631 8.31658 9.97631 7.68341 9.58579 7.29289L6.5 4.2071C6.30474 4.01184 6.30474 3.69526 6.5 3.49999C6.69526 3.30473 7.01184 3.30473 7.20711 3.49999L11.3536 7.64644C11.5488 7.8417 11.5488 8.15828 11.3536 8.35355L7.20711 12.5C7.01185 12.6953 6.69526 12.6953 6.5 12.5C6.30474 12.3047 6.30474 11.9881 6.5 11.7929L9.58579 8.7071Z" />
    </svg>
  );
}
