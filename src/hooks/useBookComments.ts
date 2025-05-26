import { useState, useEffect } from "react";

export function useBookComments(bookId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    setLoadingComments(true);
    fetch(`/api/comments?bookId=${bookId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setComments(data))
      .finally(() => setLoadingComments(false));
  }, [bookId]);

  const addComment = async (content: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ bookId, content }),
    });
    if (res.ok) {
      const created = await res.json();
      setComments((prev) => [...prev, created]);
      return true;
    }
    return false;
  };

  return { comments, loadingComments, addComment };
}
