import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lamborghini — Beyond the Expected | Independent Concept",
  description: "An independent automotive editorial exploring the Lamborghini Revuelto, Temerario, and Urus SE. Design, engineering, and a different kind of extraordinary. Unofficial design concept.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
