import { ClerkProvider } from "@clerk/nextjs/app-beta";
import Header from "../components/Header";
import "../styles/globals.css";
export const metadata = {
  title: "Mintee API",
  description: "Welcome to Mintee",
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("right here");

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="bg-[#111C27] text-white max-w-full min-h-screen mx-auto flex-col items-center justify-center py-2">
            <Header />

            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
