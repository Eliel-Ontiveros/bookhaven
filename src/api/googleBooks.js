const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

export async function fetchBooks(query, maxResults = 10) {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener datos de Google Books");
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error en la API de Google Books:", error);
    return [];
  }
}
