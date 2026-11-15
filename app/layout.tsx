import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planetary Pulse · NASA Space Apps 2026',
  description:
    'Interactive 3D/2D digital twin of Earth floating in deep space for atmospheric and marine planetary monitoring.',
  keywords: ['NASA', 'Space Apps', 'Earth Observation', 'Digital Twin', 'Three.js', 'Atmosphere', 'Oceanography'],
  openGraph: {
    title: 'Planetary Pulse · NASA Space Apps 2026',
    description: 'Interactive 3D digital twin of Earth with calibrated physical atmospheric & ocean telemetry.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
