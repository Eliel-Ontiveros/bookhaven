"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchLayout from "@/app/search-layout";

interface Book {
  id: string;
  title: string;
  authors: string;
  image?: string;
}
interface BookList {
  id: number;
  name: string;
  entries: { book: Book }[];
}
interface User {
  id: number;
  email: string;
  username: string;
  birthdate: string;
  favoriteGenres: { name: string }[];
  bookLists?: BookList[];
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const router = useRouter();

  const defaultListNames = ["Lo quiero leer", "Leyendo actualmente", "Leído"];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Por favor, inicia sesión para acceder a tu perfil.");
          router.push("/auth/login");
          return;
        }

        const response = await fetch("/api/auth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Error al obtener datos del usuario");
          alert("No se pudo cargar tu perfil. Por favor, inicia sesión nuevamente.");
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Error al conectar con el servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const calculateAge = (birthdate: string): number => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDeleteList = async () => {
    if (!selectedListId) return;
    const list = user?.bookLists?.find((l) => l.id === selectedListId);
    if (!list) return;
    if (defaultListNames.includes(list.name)) {
      alert("No puedes eliminar una lista predefinida.");
      return;
    }
    if (!confirm(`¿Seguro que deseas eliminar la lista "${list.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Por favor, inicia sesión.");
        return;
      }
      const res = await fetch("/api/booklist/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookListId: selectedListId }),
      });
      if (res.ok) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                bookLists: prev.bookLists?.filter((l) => l.id !== selectedListId),
              }
            : prev
        );
        setSelectedListId(null);
        alert("Lista eliminada correctamente.");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al eliminar la lista.");
      }
    } catch (error) {
      alert("Error al eliminar la lista.");
    }
  };

  if (loading) {
    return <div className="text-center">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="text-center">No se pudo cargar el perfil del usuario.</div>;
  }

  const selectedList = user.bookLists?.find((list) => list.id === selectedListId);

  const handleBookClick = (book: any) => {
    localStorage.setItem(
      "selectedBook",
      JSON.stringify({
        id: book.id,
        volumeInfo: {
          title: book.title,
          authors: book.authors ? book.authors.split(",").map((a: string) => a.trim()) : [],
          description: book.description ?? "",
          categories: book.categories ?? [],
          averageRating: book.averageRating ?? undefined,
          imageLinks: book.image ? { thumbnail: book.image } : undefined,
        },
      })
    );
    router.push("/book-details");
  };

  return (
    <SearchLayout>
      <div className="font-semibold bg-[#F5F5DC] w-full flex flex-col items-center py-12 min-h-screen">
        <div className="flex flex-col items-center justify-center w-full max-w-6xl p-6 text-[#5D4037]">
          <div className="flex flex-col items-center justify-center mb-8">
            <img
              src="/resources/User.png"
              alt="Avatar"
              className="h-48 w-48 rounded-full border-4 border-[#5D4037] shadow-lg bg-[#f5f5dc] mb-4"
            />
            <div className="text-center">
              <p className="text-lg">{user.username}</p>
              <p className="text-lg">Edad: {calculateAge(user.birthdate)} años</p>

            </div>
          </div>
        </div>
        {user.bookLists && user.bookLists.length > 0 && (
          <div className="w-full max-w-4xl bg-[#f5f5dc] rounded-xl shadow p-6 text-black flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2 text-sky-900 text-center w-full">Mis listas de lectura</h2>
            <div className="flex flex-col items-center w-full">
              <select
                className="border p-2 rounded mb-4 w-full max-w-xs text-center"
                value={selectedListId || ""}
                onChange={(e) => setSelectedListId(Number(e.target.value))}
              >
                <option value="">Selecciona una lista</option>
                {user.bookLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
              {selectedList &&
                !defaultListNames.includes(selectedList.name) && (
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded mb-4"
                    onClick={handleDeleteList}
                  >
                    Eliminar lista
                  </button>
                )}
            </div>
            {selectedList && (
              <div className="mb-6 w-full">

                {selectedList.entries.length > 0 ? (
                  <div className="flex flex-col md:flex-row gap-8">
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
                      {selectedList.entries.map(({ book }) => (
                        <li
                          key={book.id}
                          className="bg-[#5D4037]/10 rounded-lg p-1 mx-3 mb-3 flex flex-col items-center shadow hover:shadow-lg hover:scale-105 border-1 border-[#E2725B] cursor-pointer"
                          onClick={() => handleBookClick(book)}
                        >
                          <img
                            src={book.image || "/resources/stock-book.png"}
                            alt={book.title}
                            className="w-20 h-28 object-cover rounded mb-2"
                          />
                          <div className="text-base font-bold text-[#5D4037] text-center">{book.title}</div>
                          <div className="text-xs text-gray-700 text-center">{book.authors}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm text-center">No hay libros en esta lista.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </SearchLayout>
  );
}
