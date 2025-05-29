export const genreTranslations: Record<string, string> = {
  "Ficcion": "Fiction",
  "Misterio": "Mystery",
  "Romance": "Romance",
  "Fantasia": "Fantasy",
  "Historia": "History",
  "Biografia": "Biography",
  "Poesia": "Poetry",
  "Drama": "Drama",
  "Terror": "Horror",
  "Comic": "Comics",
  "Novela": "Novel",
  "Viajes": "Travel",
  "Cocina": "Cooking",
  "Salud": "Health",
  "Negocios": "Business",
  "Tecnologia": "Technology",
  "Arte": "Art",
  "Politica": "Politics",
  "Religion": "Religion"
};

export async function fetchBooksByGenres(genres: string[]): Promise<any[]> {
  const allBooks: Record<string, any> = {};
  for (const genre of genres) {
    const startIndex = Math.floor(Math.random() * 20);
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genre)}&startIndex=${startIndex}&maxResults=20`;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      (data.items || []).forEach((book: any) => {
        allBooks[book.id] = book;
      });
    } catch (error) {
      console.error(`Error buscando libros para género ${genre}:`, error);
    }
  }
  return Object.values(allBooks);
}
