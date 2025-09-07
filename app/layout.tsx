import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
	title: 'SeishinZ AI',
	description: 'Autonomous Shape Chain agent',
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen antialiased bg-white text-zinc-900">
				{children}
			</body>
		</html>
	)
} 