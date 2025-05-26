"use client";
import SearchLayout from "./search-layout";
import Link from "next/link";

export default function Home() {
  return (
    <SearchLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5DC] text-[#5D4037] pb-24">
        <img
          src="/resources/Logot.png"
          alt="BookHaven Logo"
          className="h-60 w-auto mb-6 drop-shadow-lg"
        />
        <h1 className="text-4xl font-extrabold mb-4">¡Bienvenido a BookHaven!</h1>
        <p className="text-xl mb-6 max-w-xl text-center">
          Tu espacio para descubrir, organizar y disfrutar de tus libros favoritos. Explora recomendaciones personalizadas, gestiona tus listas de lectura y mantén tu perfil actualizado.
        </p>
      </div>
    </SearchLayout>
  );
}
