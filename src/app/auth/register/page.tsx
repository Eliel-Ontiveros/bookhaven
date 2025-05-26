"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    setGenres([
          "Ficcion",
          "Misterio",
          "Romance",
          "Fantasia",
          "Historia",
          "Biografia",
          "Poesia",
          "Drama",
          "Terror",
          "Comic",
          "Novela",
          "Viajes",
          "Cocina",
          "Salud",
          "Negocios",
          "Tecnologia",
          "Arte",
          "Politica",
          "Religion",
    ]);
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = { email, password, username, birthdate, favoriteGenres: selectedGenres, type: "register" };

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
        router.push("/auth/login");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al registrar usuario");
      }
    } catch (error) {
      toast.error("Error de red al registrar usuario");
    }
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5DC] text-[#5D4037]">
      <form
        onSubmit={handleRegister}
        className="bg-white border-2 border-[#E2725B] shadow-xl rounded-2xl px-8 py-8 w-full max-w-md flex flex-col gap-4"
      >
        <div className="flex flex-col items-center mb-2">
          <img src="/resources/Logot.png" alt="BookHaven Logo" className="h-20 w-auto mb-2 drop-shadow-lg" />
          <h1 className="text-3xl font-extrabold mb-2 text-[#5D4037]">Registro</h1>
        </div>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border-2 border-[#BFBDB8] rounded-lg focus:outline-none focus:border-[#E2725B] bg-[#FFFDD0] text-[#5D4037] placeholder-[#BFBDB8]"
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border-2 border-[#BFBDB8] rounded-lg focus:outline-none focus:border-[#E2725B] bg-[#FFFDD0] text-[#5D4037] placeholder-[#BFBDB8]"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border-2 border-[#BFBDB8] rounded-lg focus:outline-none focus:border-[#E2725B] bg-[#FFFDD0] text-[#5D4037] placeholder-[#BFBDB8]"
          required
        />
        <input
          type="date"
          placeholder="Fecha de nacimiento"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full p-3 border-2 border-[#BFBDB8] rounded-lg focus:outline-none focus:border-[#E2725B] bg-[#FFFDD0] text-[#5D4037] placeholder-[#BFBDB8]"
          required
        />
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2 text-[#5D4037]">Selecciona tus géneros favoritos:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2">
            {genres.map((genre) => (
              <label
                key={genre}
                className={`flex items-center px-3 py-1 rounded-lg border transition-colors cursor-pointer font-medium text-sm
                  ${selectedGenres.includes(genre)
                    ? 'bg-[#E2725B] text-white border-[#E2725B] shadow'
                    : 'bg-[#FFFDD0] text-[#5D4037] border-[#E2725B] hover:bg-[#F5F5DC]'}
                `}
              >
                <input
                  type="checkbox"
                  value={genre}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                  className="mr-2 accent-[#E2725B]"
                />
                {genre}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#E2725B] hover:bg-[#5D4037] text-white font-bold py-3 rounded-lg transition-colors duration-200 shadow-md mt-2"
        >
          Registrarse
        </button>
        <p className="mt-2 text-sm text-center text-[#5D4037]">
          ¿Ya tienes una cuenta?{' '}
          <a href="/auth/login" className="text-[#E2725B] hover:underline font-semibold">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
}
