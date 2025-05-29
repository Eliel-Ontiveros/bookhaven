import { useEffect, useState } from "react";
import { fetchBooksByGenres, genreTranslations } from "../utils/books";

export interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    description: string;
    categories?: string[];
    imageLinks?: {
      thumbnail: string;
    };
  };
}

export function useRecommendations() {
  const [booksByGenre, setBooksByGenre] = useState<Record<string, Book[]>>({});
  const [loading, setLoading] = useState(true);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [extraGenres, setExtraGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showGenres, setShowGenres] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Por favor, inicia sesión para ver recomendaciones.");
          return;
        }
        const userResponse = await fetch("/api/auth", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            const errorData = await userResponse.json();
            if (errorData.error === "Token expirado") {
              localStorage.removeItem("token");
              alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
              window.location.href = "/auth/login";
              return;
            }
          }
          console.error("Error al obtener los géneros favoritos del usuario");
          return;
        }
        const userData = await userResponse.json();
        const genres = userData.favoriteGenres.map((genre: { name: string }) => genre.name);
        setFavoriteGenres(genres);
        setAllGenres(Object.keys(genreTranslations));
        const booksByGenreObj: Record<string, Book[]> = {};
        for (const genre of genres) {
          const genreEn = genreTranslations[genre] || genre;
          let results = await fetchBooksByGenres([genreEn]);
          if (!results || results.length === 0) {
            const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genreEn)}&startIndex=0`;
            try {
              const response = await fetch(url);
              if (response.ok) {
                const data = await response.json();
                results = data.items || [];
              }
            } catch {}
          }
          const shuffled = results.sort(() => Math.random() - 0.5);
          booksByGenreObj[genre] = shuffled.slice(0, 10);
        }
        setBooksByGenre(booksByGenreObj);
      } catch (error) {
        console.error("Error al obtener recomendaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  useEffect(() => {
    const fetchExtraGenres = async () => {
      if (selectedGenres.length === 0) return;
      setLoading(true);
      const booksByGenreObj: Record<string, Book[]> = { ...booksByGenre };
      for (const genre of selectedGenres) {
        if (booksByGenreObj[genre]) continue;
        const genreEn = genreTranslations[genre] || genre;
        let results = await fetchBooksByGenres([genreEn]);
        if (!results || results.length === 0) {
          const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genreEn)}&startIndex=0`;
          try {
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              results = data.items || [];
            }
          } catch {}
        }
        const filtered = results.filter((book: Book) => {
          const categories = book.volumeInfo.categories || [];
          return categories.some((cat: string) =>
            cat.toLowerCase().includes(genreEn.toLowerCase())
          );
        });
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        booksByGenreObj[genre] = shuffled.slice(0, 10);
      }
      setBooksByGenre(booksByGenreObj);
      setLoading(false);
    };
    fetchExtraGenres();
  }, [selectedGenres]);

  useEffect(() => {
    const fetchExtraGenres = async () => {
      setLoading(true);
      const booksByGenreObj: Record<string, Book[]> = { ...booksByGenre };
      for (const genre of extraGenres) {
        if (!booksByGenreObj[genre]) {
          let results = await fetchBooksByGenres([genre]);
          if (!results || results.length === 0) {
            const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genre)}&startIndex=0`;
            try {
              const response = await fetch(url);
              if (response.ok) {
                const data = await response.json();
                results = data.items || [];
              }
            } catch {}
          }
          const shuffled = results.sort(() => Math.random() - 0.5);
          booksByGenreObj[genre] = shuffled.slice(0, 10);
        }
      }
      Object.keys(booksByGenreObj).forEach((g) => {
        if (!favoriteGenres.includes(g) && !extraGenres.includes(g)) {
          delete booksByGenreObj[g];
        }
      });
      setBooksByGenre(booksByGenreObj);
      setLoading(false);
    };
    fetchExtraGenres();
  }, [extraGenres]);

  return {
    booksByGenre,
    loading,
    favoriteGenres,
    allGenres,
    extraGenres,
    selectedGenres,
    showGenres,
    setSelectedGenres,
    setExtraGenres,
    setShowGenres,
  };
}
