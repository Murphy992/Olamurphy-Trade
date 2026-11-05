import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Olamurphy Trade",
  description: "Educational demo trading platform"
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
