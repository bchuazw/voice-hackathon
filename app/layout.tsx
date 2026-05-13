import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Archimedes — Voice agent for shower thoughts',
  description: 'Capture, route, and resurface your passing thoughts. Hands-free.',
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#0b1220',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-archimedes-ink text-archimedes-mist antialiased">{children}</body>
    </html>
  );
}
