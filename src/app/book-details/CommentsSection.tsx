import React from "react";

interface CommentsSectionProps {
  comments: any[];
  loading: boolean;
  newComment: string;
  setNewComment: (c: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  loading,
  newComment,
  setNewComment,
  onSubmit,
}) => (
  <div className="mt-12 border-t pt-6 w-250">
    <h2 className="text-xl font-bold mb-4 text-[#E2725B]">Comentarios</h2>
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <textarea
        className="border rounded p-2"
        rows={3}
        placeholder="Escribe un comentario..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        required
      />
      <button
        type="submit"
        className="self-end px-4 py-2 bg-[#E2725B] text-white rounded hover:bg-[#c95c47] transition"
      >
        Comentar
      </button>
    </form>
    {loading ? (
      <div>Cargando comentarios...</div>
    ) : (
      <div className="my-5">
        {comments.length === 0 && (
          <div className="text-gray-500 mb-4">No hay comentarios aún.</div>
        )}
        <ul className="mb-6">
          {comments.slice().reverse().map((comment: any) => (
            <li key={comment.id} className="mb-3 p-3 bg-[#E27251]/30 rounded shadow">
              <div className="font-semibold underline">{comment.user?.name || "Usuario"}</div>
              <div className="font-light my-3">{comment.content}</div>
              <div className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default CommentsSection;
