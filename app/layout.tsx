import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ProblemsProvider } from './context/ProblemsContext';
import { UserProvider } from './context/UserContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ProblemX — Real-World Problem Discovery Platform',
  description: 'ProblemX collects, validates, and archives real-world problem statements for students to discover and solve.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', background: '#08080f', fontFamily: 'var(--font-inter), Inter, -apple-system, sans-serif' }}>
        <UserProvider>
          <ProblemsProvider>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                {children}
              </main>
            </div>
            <ToastContainer />
          </ProblemsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
