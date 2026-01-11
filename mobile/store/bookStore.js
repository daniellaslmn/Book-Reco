import { create } from "zustand"; 

export const useBookStore = create((set) => ({
  books: [],
  deletedBookId: null,
  updatedAt: Date.now(),

  setBooks: (books) => set({ books, updatedAt: Date.now() }),
  addBook: (book) => set((state) => ({ books: [book, ...state.books], updatedAt: Date.now() })),
  deleteBook: (id) => set((state) => ({
    books: state.books.filter(b => b._id !== id),
    deletedBookId: id,
    updatedAt: Date.now(),
  })),
  refreshBooks: () => set({ updatedAt: Date.now() }),
  
  notifyBookCreated: (book) => {
  const normalizedBook = {
    ...book,
    _id: book._id || book.id, // ensure _id exists
  };

  set((state) => ({
    books: [normalizedBook, ...state.books],
    updatedAt: Date.now(),
  }));
},
  notifyBookDeleted: (id) => set((state) => ({
    books: state.books.filter((b) => b._id !== id),
    deletedBookId: id,
    updatedAt: Date.now(),
  })),
}));
