import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Providers from "~/components/providers";
import { siteConfig } from "~/lib/site";
import "../index.css";

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: siteConfig.name,
	description: siteConfig.description,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html className="h-full dark" lang="en">
			<body className={`${geistMono.variable} ${inter.variable} h-full antialiased`}>
				<Providers>
					<div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
				</Providers>
			</body>
		</html>
	);
}
