import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Customer Support Chatbot",
  description: "This project is an AI-powered customer support chatbot built using Next.js and the OpenAI API. The chatbot is designed to handle customer queries efficiently and provide accurate responses, enhancing user experience and reducing the load on human support agents.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
