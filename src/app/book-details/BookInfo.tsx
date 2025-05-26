import React from "react";
import StarRating from "./StarRating";
import InteractiveStarRating from "./InteractiveStarRating";

interface BookInfoProps {
  book: any;
}

const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
  const [userRating, setUserRating] = React.useState<number>(0);
  const [average, setAverage] = React.useState<number>(book.volumeInfo.averageRating || 0);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch(`/api/ratings?bookId=${book.id}`)
      .then(res => res.json())
      .then(data => {
        setAverage(data.average || 0);
        setCount(data.count || 0);
      });
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`/api/ratings?bookId=${book.id}&userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.userRating) setUserRating(data.userRating);
        });
    }
  }, [book.id]);

  const handleRate = async (rating: number) => {
    setLoading(true);
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Debes iniciar sesión para calificar");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: book.id, userId, rating }),
    });
    const data = await res.json();
    setAverage(data.average);
    setCount(data.count);
    setUserRating(rating);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center text-center md:items-center flex-1">
      <h1 className="text-2xl font-bold mb-4">{book.volumeInfo.title}</h1>
      {book.volumeInfo.imageLinks?.thumbnail && (
        <img
          className="rounded-lg mb-4 h-60 md:items-center"
          src={book.volumeInfo.imageLinks.thumbnail}
          alt={book.volumeInfo.title}
        />
      )}
      <h2 className="text-lg font-medium my-3">
        Autores: {book.volumeInfo.authors?.join(", ") ?? "No se definen los autores"}
      </h2>
      <h3 className="text-md font-light my-2">
        Géneros: {book.volumeInfo.categories?.join(", ") ?? "No se definen los generos"}
      </h3>
      <div className="flex flex-col items-center">
        <span className="text-sm font-light mb-1">Calificación promedio:</span>
        <StarRating rating={average} />
        <span className="text-xs text-gray-500">({Number.isFinite(average) ? average.toFixed(2) : "0.00"} de {count} calificaciones)</span>
        <span className="text-sm mt-2">Tu calificación:</span>
        <InteractiveStarRating initialRating={userRating} onRate={handleRate} disabled={loading} />
      </div>
    </div>
  );
};

export default BookInfo;
