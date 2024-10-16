// frontend/src/app/layout.js

import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'NoteHub',
  description: 'Collaborative note-taking App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
