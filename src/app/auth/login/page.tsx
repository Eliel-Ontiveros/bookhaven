"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        if (payload.userId) {
          localStorage.setItem("userId", payload.userId.toString());
        }
        toast.success("Inicio de sesión exitoso");
        router.push("/");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al iniciar sesión");
      }
    } catch (error) {
      toast.error("Error de red al iniciar sesión");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5DC] text-[#5D4037]">
      <form
        onSubmit={handleLogin}
        className="bg-white border-2 border-[#E2725B] shadow-xl rounded-2xl px-8 py-8 w-full max-w-md flex flex-col gap-4"
      >
        <div className="flex flex-col items-center mb-2">
          <img src="/resources/Logot.png" alt="BookHaven Logo" className="h-20 w-auto mb-2 drop-shadow-lg" />
          <h1 className="text-3xl font-extrabold mb-2 text-[#5D4037]">Iniciar Sesión</h1>
        </div>
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
        <button
          type="submit"
          className="w-full bg-[#E2725B] hover:bg-[#5D4037] text-white font-bold py-3 rounded-lg transition-colors duration-200 shadow-md mt-2"
        >
          Iniciar Sesión
        </button>
        <p className="mt-2 text-sm text-center text-[#5D4037]">
          ¿No tienes una cuenta?{' '}
          <a href="/auth/register" className="text-[#E2725B] hover:underline font-semibold">
            Regístrate
          </a>
        </p>
      </form>
    </div>
  );
}
