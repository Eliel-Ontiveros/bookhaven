"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow pb-16">{children}</div>
      <footer className="bg-[#FFFDD0] text-white border-2 border-[#BFBDB8] p-4 fixed bottom-0 w-full z-50">
        <form onSubmit={handleSearch} className="flex gap-2 justify-center text-white">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar libros..."
            className="px-2 py-1 rounded placeholder-black text-black border-1 border-[#E2725B]"
          />
        </form>
      </footer>
    </div>
  );
}
