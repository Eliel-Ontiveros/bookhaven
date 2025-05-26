"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameStr = pathname || "";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const publicPaths = ["/auth/login", "/auth/register"];
    const token = localStorage.getItem("token");

    if (!token && !publicPaths.includes(pathnameStr)) {
      router.push("/auth/login");
    }

    setIsLoggedIn(!!token);
  }, [router, pathnameStr]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      {/* Toaster global para notificaciones */}
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-blue-100 via-white to-amber-100`}
        >
          {/* Oculta el header/nav en login y register */}
          {!["/auth/login", "/auth/register"].includes(pathnameStr) && (
            <header className="bg-[#5D4037] shadow-lg backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                  <a className="flex items-center gap-2">
                    <img
                      className="h-17 w-auto drop-shadow-lg"
                      src="/resources/Logot.png"
                      alt="BookHaven Logo"
                    />
                  </a>
                </div>

                {mounted && (
                  <nav className="flex gap-8 text-2xl font-medium text-[#FAF0E6]">
                    <a
                      href="/"
                      className="hover:scale-110 duration-150 px-2 py-1"
                    >
                      Inicio
                    </a>
                    <a
                      href="/recommendations"
                      className="hover:scale-110 duration-150 px-2 py-1"
                    >
                      Recomendaciones
                    </a>
                    <a
                      href="/profile"
                      className="hover:scale-110 duration-150 px-2 py-1"
                    >
                      Perfil
                    </a>
                    
                    {isLoggedIn && (
                      <a
                        href="/auth/logout"
                        className="hover:text-red-600 hover:scale-110 duration-150 px-2 py-1"
                      >
                        Cerrar sesión
                      </a>
                    )}
                  </nav>
                )}
              </div>
            </header>
          )}
          <main className="min-h-[calc(100vh-80px)] flex flex-col">
            {children}
          </main>
        </body>
      </html>
    </>
  );
}
