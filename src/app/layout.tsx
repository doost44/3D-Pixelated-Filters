import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pixel Loop Studio',
  description: 'Turn videos into looping pixel-art animations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js" async={true} />
      </head>
      <body className="bg-black text-white font-mono overflow-hidden">{children}</body>
    </html>
  )
}
