'use client';

import './globals.css';
import { AuthProvider } from '../lib/authContext';

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
