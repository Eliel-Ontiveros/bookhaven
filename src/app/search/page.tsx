"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetchBooks } from "@/api/googleBooks";
import SearchLayout from "../search-layout";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    description: string;
    averageRating?: number;
    imageLinks?: {
      thumbnail: string;
    };
  };
}

function SearchResultsComponent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("query") || "";
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetchBooks(query).then((results) => {
        setBooks(results);
        setLoading(false);
      });
    } else {
      setBooks([]);
    }
  }, [query]);

  const handleBookClick = (book: Book) => {
    localStorage.setItem("selectedBook", JSON.stringify(book));
    router.push("/book-details");
  };

  return (
    <SearchLayout>
      <div className="font-semibold bg-[#F5F5DC] flex flex-col items-center text-amber-600 min-h-screen pb-24">
        <h1 className="text-2xl font-bold my-4">Resultados de búsqueda</h1>
        {loading && <div className="text-center">Buscando libros...</div>}
        {!loading && books.length === 0 && (
          <div className="text-center text-gray-500">No se encontraron resultados.</div>
        )}
        <ul className="grid grid-cols-3 gap-3 my-7 w-250">
          {books.map((book) => (
            <li key={book.id}>
              <div
                className="w-64 h-96 border-4 rounded-2xl text-black font-bold bg-white flex flex-col items-center justify-between p-4 cursor-pointer"
                onClick={() => handleBookClick(book)}
              >
                <img
                  className="w-32 h-44 object-cover mx-auto mb-2"
                  src={
                    book.volumeInfo.imageLinks?.thumbnail
                      ? book.volumeInfo.imageLinks.thumbnail
                      : "/resources/stock-book.png"
                  }
                  alt={book.volumeInfo.title}
                />
                <h3 className="font-bold text-black text-xl text-center line-clamp-2">{book.volumeInfo.title}</h3>
                <h4 className="text-base font-extralight text-center line-clamp-1">{book.volumeInfo.authors?.join(", ")}</h4>
                <h4 className="text-base font-extralight line-clamp-3">
                  {book.volumeInfo.description?.split(" ").slice(0, 30).join(" ")} ...
                </h4>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SearchLayout>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={<div>Cargando búsqueda...</div>}>
      <SearchResultsComponent />
    </Suspense>
  );
}
