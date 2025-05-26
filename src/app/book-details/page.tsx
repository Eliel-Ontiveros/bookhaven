"use client";
import { useEffect, useState } from "react";
import SearchLayout from "../search-layout";
import { toast } from "react-hot-toast";
import BookInfo from "./BookInfo";
import BookListModal from "./BookListModal";
import CommentsSection from "./CommentsSection";
import { useBookLists } from "../../hooks/useBookLists";
import { useBookComments } from "../../hooks/useBookComments";

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    description: string;
    categories?: string[];
    averageRating?: number;
    imageLinks?: {
      thumbnail: string;
    };
  };
}

export default function BookDetails() {
  const [book, setBook] = useState<Book | null>(null);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState("");

  const {
    bookLists,
    listNameWithBook,
    listIdWithBook,
    fetchListsAndFindBook,
    setBookLists,
    setListNameWithBook,
    setListIdWithBook,
  } = useBookLists(book);

  const { comments, loadingComments, addComment } = useBookComments(book?.id || "");

  useEffect(() => {
    const storedBook = localStorage.getItem("selectedBook");
    if (storedBook) {
      const parsedBook = JSON.parse(storedBook);
      setBook(parsedBook);
      fetchListsAndFindBook(parsedBook);
    } else {
      fetchListsAndFindBook(null);
    }
  }, []);

  useEffect(() => {
    if (book) {
      fetchListsAndFindBook(book);
    }
  }, [book]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !book) return;
    const ok = await addComment(newComment);
    if (ok) setNewComment("");
    else toast.error("Error al publicar el comentario");
  };

  if (!book) {
    return <div className="text-center">Cargando detalles del libro...</div>;
  }

  return (
    <SearchLayout>
      <div className="font-semibold w-full h-full min-h-screen bg-[#F5F5DC] flex flex-col items-center p-4 text-black">
        <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8 mt-8">
          <BookInfo book={book} />
          
          {/* Contenedor derecho: descripción */}
          <div className="flex-1 flex justify-center items-start">
            <div className="bg-[#FFFDD0] rounded-xl shadow p-6 max-w-2xl w-full text-justify text-[#5D4037]">
              <p className="text-base">{book.volumeInfo.description ?? "Sin descripcion"}</p>
            </div>
          </div>
        </div>

        {/*Agregar a una lista*/}
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#7B241C] text-white px-6 py-2 rounded-lg mt-8 font-bold shadow hover:bg-[#BC8F8F] transition"
        >
          {listNameWithBook ? `Guardado en: ${listNameWithBook}` : "Agregar a una lista"}
        </button>
        <BookListModal
          show={showModal}
          onClose={() => setShowModal(false)}
          bookLists={bookLists}
          selectedListId={selectedListId}
          setSelectedListId={setSelectedListId}
          handleAddToBookList={async () => {
            if (!selectedListId || !book) {
              toast.error("Selecciona una lista para agregar el libro.");
              return;
            }
            try {
              const token = localStorage.getItem("token");
              if (!token) {
                toast.error("Por favor, inicia sesión para agregar libros.");
                return;
              }
              const response = await fetch("/api/booklist", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  bookId: book.id,
                  bookListId: selectedListId,
                  title: book.volumeInfo.title,
                  authors: book.volumeInfo.authors?.join(", ") ?? "",
                  image: book.volumeInfo.imageLinks?.thumbnail ?? "",
                  description: book.volumeInfo.description ?? "",
                  categories: book.volumeInfo.categories ?? [],
                  averageRating: book.volumeInfo.averageRating ?? null,
                }),
              });
              if (response.ok) {
                toast.success("Libro agregado a la lista.");
                setShowModal(false);
                await fetchListsAndFindBook(book);
              } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Error al agregar el libro.");
              }
            } catch (error) {
              console.error("Error al agregar libro a la lista:", error);
            }
          }}
          handleRemoveFromBookList={async () => {
            if (!listIdWithBook || !book) return;
            try {
              const token = localStorage.getItem("token");
              if (!token) {
                toast.error("Por favor, inicia sesión para eliminar libros.");
                return;
              }
              const response = await fetch("/api/booklist", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  bookId: book.id,
                  bookListId: listIdWithBook,
                }),
              });
              if (response.ok) {
                toast.success("Libro eliminado de la lista.");
                setShowModal(false);
                await fetchListsAndFindBook(book);
              } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Error al eliminar el libro.");
              }
            } catch (error) {
              console.error("Error al eliminar libro de la lista:", error);
            }
          }}
          listIdWithBook={listIdWithBook}
          listNameWithBook={listNameWithBook}
          newListName={newListName}
          setNewListName={setNewListName}
          handleCreateList={async () => {
            if (!newListName.trim()) {
              toast.error("El nombre de la lista no puede estar vacío.");
              return;
            }
            try {
              setCreatingList(true);
              const token = localStorage.getItem("token");
              if (!token) {
                toast.error("Por favor, inicia sesión para crear listas.");
                setCreatingList(false);
                return;
              }
              const response = await fetch("/api/booklist", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newListName }),
              });
              if (response.ok) {
                setNewListName("");
                await fetchListsAndFindBook(book);
                const data = await response.json();
                setSelectedListId(data.id);
              } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Error al crear la lista.");
              }
            } catch (error) {
              console.error("Error al crear la lista:", error);
            }
            setCreatingList(false);
          }}
          creatingList={creatingList}
        />
        <CommentsSection
          comments={comments}
          loading={loadingComments}
          newComment={newComment}
          setNewComment={setNewComment}
          onSubmit={handleCommentSubmit}
        />
      </div>
    </SearchLayout>
  );
}