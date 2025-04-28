import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Easy Deploy',
  description: 'Created with ❤️',
  generator: 'adel.engnieer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <link rel="icon" href="/rocket.svg" sizes="any" />
      </head>
      <body suppressHydrationWarning={true} >
        {children}
      </body>
    </html>
  )
}
