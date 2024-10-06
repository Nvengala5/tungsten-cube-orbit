import { Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

const spacemono = Space_Mono({ weight: ['400', '700'], variable: '--font-mono', subsets: ['latin']})

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
       className={`${spacemono.variable} bg-neutral-800 text-white font-mono`}
      >
        <Navbar/>
        <div className="flex max-w-scree">
        <Sidebar/>
        {children}
        </div>
      </body>
    </html>
  );
}
