"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchLayout from "../search-layout";
import { useRecommendations, Book } from "../../hooks/useRecommendations";

export default function Recommendations() {
  const {
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
  } = useRecommendations();
  const [authorName, setAuthorName] = useState("");
  const [authorBooks, setAuthorBooks] = useState<Book[]>([]);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [loadingAuthor, setLoadingAuthor] = useState(false);
  const router = useRouter();

  const handleBookClick = (book: Book) => {
    localStorage.setItem("selectedBook", JSON.stringify(book));
    router.push("/book-details");
  };

  const handleGenreCheckbox = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setExtraGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleOpenAuthorModal = () => {
    setAuthorName("");
    setAuthorBooks([]);
    setShowAuthorModal(true);
  };

  const handleSearchAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) return;
    setLoadingAuthor(true);
    setAuthorBooks([]);
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(
        authorName.trim()
      )}&maxResults=20`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAuthorBooks(data.items || []);
      } else {
        setAuthorBooks([]);
      }
    } catch {
      setAuthorBooks([]);
    }
    setLoadingAuthor(false);
  };

  if (loading) {
    return <div className="text-center">Cargando recomendaciones...</div>;
  }

  return (
    <SearchLayout>
      <div className="font-semibold bg-[#F5F5DC] flex flex-col items-center">
        <h1 className="text-2xl font-bold my-4 text-[#E2725B]">
          Recomendaciones
        </h1>
        <div className="mb-2 flex gap-2">
          <button
            className="px-4 py-2 bg-[#E2725B] text-white rounded hover:bg-[#c95c47] transition"
            type="button"
            onClick={handleOpenAuthorModal}
          >
            Filtrar por autor
          </button>
          <button
            className="px-4 py-2 bg-[#E2725B] text-white rounded hover:bg-[#c95c47] transition"
            type="button"
            onClick={() => setShowGenres((prev) => !prev)}
          >
            {showGenres ? "Ocultar géneros" : "Explorar otros géneros"}
          </button>
        </div>
        {showAuthorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm text-black">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={() => setShowAuthorModal(false)}
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-4 text-[#E2725B]">
                Buscar libros por autor
              </h2>
              <form onSubmit={handleSearchAuthor} className="flex flex-col gap-3">
                <input
                  type="text"
                  className="border rounded p-2"
                  placeholder="Nombre del autor"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-[#E2725B] text-white rounded px-4 py-2 hover:bg-[#c95c47] transition"
                  disabled={loadingAuthor}
                >
                  {loadingAuthor ? "Buscando..." : "Buscar"}
                </button>
              </form>
              <div className="mt-4 max-h-96 overflow-y-auto">
                {loadingAuthor && <div className="text-center">Buscando libros...</div>}
                {!loadingAuthor && authorBooks.length === 0 && authorName && (
                  <div className="text-center text-gray-500">
                    No se encontraron libros para este autor.
                  </div>
                )}
                {!loadingAuthor && authorBooks.length > 0 && (
                  <ul className="grid grid-cols-1 gap-4">
                    {authorBooks.map((book: Book) => (
                      <li
                        key={book.id}
                        className="flex gap-3 items-center cursor-pointer hover:bg-[#F5F5DC] rounded p-2"
                        onClick={() => {
                          localStorage.setItem("selectedBook", JSON.stringify(book));
                          setShowAuthorModal(false);
                          router.push("/book-details");
                        }}
                      >
                        <img
                          src={book.volumeInfo.imageLinks?.thumbnail || "/resources/stock-book.png"}
                          alt={book.volumeInfo.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div>
                          <div className="font-bold text-[#E2725B]">{book.volumeInfo.title}</div>
                          <div className="text-sm text-gray-700">{book.volumeInfo.authors?.join(", ")}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="mb-4 w-full max-w-4xl flex flex-col items-center">
          {showGenres && (
            <div className="flex flex-wrap gap-2 justify-center">
              {allGenres
                .filter((g) => !favoriteGenres.includes(g))
                .map((g) => (
                  <label
                    key={g}
                    className={`px-3 py-1 rounded border cursor-pointer ${
                      extraGenres.includes(g)
                        ? "bg-[#E2725B] text-white border-[#E2725B]"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mr-1 accent-[#E2725B]"
                      checked={extraGenres.includes(g)}
                      onChange={() => handleGenreCheckbox(g)}
                    />
                    {g}
                  </label>
                ))}
            </div>
          )}
        </div>
        {favoriteGenres.length === 0 && (
          <div className="text-center text-gray-500">No tienes géneros favoritos seleccionados.</div>
        )}
        {[...favoriteGenres, ...extraGenres].map((genre) => (
          <div key={genre} className="w-full max-w-6xl mb-10"> 
            <h2 className="text-xl font-bold mb-3 text-[#E2725B] border-b-2 border-[#E2725B] pb-1 pl-1">
              {genre}
            </h2>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#E2725B]/70 scrollbar-track-[#FFFDD0]">
              <ul className="flex flex-row gap-4 min-w-full pb-2">
                {(booksByGenre[genre] || []).length === 0 && (
                  <li className="text-gray-500">Cargando libros recomendados...</li>
                )}
                {(booksByGenre[genre] || []).map((book) => (
                  <li key={book.id} className="flex-shrink-0">
                    <div
                      className="w-64 h-96 border-4 rounded-2xl text-black font-bold bg-[#F5F5DC] flex flex-col cursor-pointer items-center justify-between p-4"
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
          </div>
        ))}
      </div>
    </SearchLayout>
  );
}