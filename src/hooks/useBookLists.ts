import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export interface BookList {
  id: number;
  name: string;
}

export function useBookLists(book: any) {
  const [bookLists, setBookLists] = useState<BookList[]>([]);
  const [listNameWithBook, setListNameWithBook] = useState<string | null>(null);
  const [listIdWithBook, setListIdWithBook] = useState<number | null>(null);

  const fetchListsAndFindBook = useCallback(async (bookToCheck?: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Por favor, inicia sesión para acceder a tus listas.");
        setBookLists([]);
        setListNameWithBook(null);
        setListIdWithBook(null);
        return;
      }
      const response = await fetch("/api/auth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.error === "Token expirado") {
          localStorage.removeItem("token");
          toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          window.location.href = "/auth/login";
          return;
        }
      }
      if (response.ok) {
        const data = await response.json();
        const lists = (data.bookLists || []).map((l: any) => ({
          id: l.id,
          name: l.name,
        }));
        setBookLists(lists);
        const bookCheck = bookToCheck ?? book;
        let found = false;
        if (bookCheck) {
          for (const l of data.bookLists || []) {
            if (
              l.entries &&
              l.entries.some(
                (entry: any) =>
                  entry.book &&
                  (entry.book.id === bookCheck.id ||
                    entry.book.id === String(bookCheck.id))
              )
            ) {
              setListNameWithBook(l.name);
              setListIdWithBook(l.id);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          setListNameWithBook(null);
          setListIdWithBook(null);
        }
      } else {
        setBookLists([]);
        setListNameWithBook(null);
        setListIdWithBook(null);
        console.error("Error al obtener las listas de lectura");
      }
    } catch (error) {
      setBookLists([]);
      setListNameWithBook(null);
      setListIdWithBook(null);
      console.error("Error al conectar con el servidor:", error);
    }
  }, [book]);

  return {
    bookLists,
    listNameWithBook,
    listIdWithBook,
    fetchListsAndFindBook,
    setBookLists,
    setListNameWithBook,
    setListIdWithBook,
  };
}
