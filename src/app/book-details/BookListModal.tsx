import React from "react";

interface BookListModalProps {
  show: boolean;
  onClose: () => void;
  bookLists: { id: number; name: string }[];
  selectedListId: number | null;
  setSelectedListId: (id: number | null) => void;
  handleAddToBookList: () => void;
  handleRemoveFromBookList: () => void;
  listIdWithBook: number | null;
  listNameWithBook: string | null;
  newListName: string;
  setNewListName: (name: string) => void;
  handleCreateList: () => void;
  creatingList: boolean;
}

const BookListModal: React.FC<BookListModalProps> = ({
  show,
  onClose,
  bookLists,
  selectedListId,
  setSelectedListId,
  handleAddToBookList,
  handleRemoveFromBookList,
  listIdWithBook,
  listNameWithBook,
  newListName,
  setNewListName,
  handleCreateList,
  creatingList,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative border-2 border-[#5D4037]">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-2xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Selecciona o crea una lista</h2>
        <select
          id="bookList"
          value={selectedListId || ""}
          onChange={(e) => setSelectedListId(Number(e.target.value))}
          className="border p-2 rounded w-full mb-4"
        >
          <option value="">Selecciona una lista</option>
          {bookLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddToBookList}
          className="bg-[#E2725B] text-white px-4 py-2 rounded w-full mb-4 hover:bg-[#c95c47]"
          disabled={!selectedListId || (listIdWithBook !== null && selectedListId === listIdWithBook)}
        >
          Guardar en la lista
        </button>
        {listIdWithBook !== null && (
          <button
            onClick={handleRemoveFromBookList}
            className="bg-orange-800 text-white px-4 py-2 rounded w-full mb-4 hover:bg-orange-700"
          >
            Eliminar de la lista "{listNameWithBook}"
          </button>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre de la nueva lista"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={handleCreateList}
            className="bg-[#2E8B57] text-white px-4 py-2 rounded hover:bg-[#8FBC8F]"
            disabled={creatingList}
          >
            {creatingList ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookListModal;
