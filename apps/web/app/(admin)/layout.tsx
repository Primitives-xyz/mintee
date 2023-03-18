import { auth, ClerkProvider } from "@clerk/nextjs/app-beta";
import "../../styles/globals.css";
import Sidebar from "./sidebar";
export const metadata = {
  title: "Fastest NFT minting service",
  description: "Mintee is the fastest NFT minting service.",
  ogImage: "https://minte.vercel.app/warp.jpeg",
  siteName: "Mintee",
  "og:site_name": "Mintee",
  "og:description": "Mintee is the fastest NFT minting service.",
  "og:title": "Fastest NFT minting service",
  "twitter:card": "summary_large_image",
  "twitter:title": "Fastest NFT minting service",
  "twitter:description": "Mintee is the fastest NFT minting service.",
  "og:image": "https://minte.vercel.app/warp.jpeg",
  "twitter:image": "https://minte.vercel.app/warp.jpeg",
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="flex flex-row">
            <Sidebar />
            <div className="bg-[#111C27]/75 text-white w-full px-4 min-h-screen mx-auto flex-col items-center justify-center py-2">
              {children}
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
