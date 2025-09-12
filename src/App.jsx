// src/App.jsx
import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api/todos";
import gsap from "gsap";
import {
  Plus,
  Trash2,
  Square,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./index.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const todosPerPage = 5;

  useEffect(() => {
    getTodos().then(setTodos).catch(console.error);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTodo = await createTodo(title, description);
    setTodos((prev) => [...prev, newTodo]);
    setTitle("");
    setDescription("");

    // Animate Add button pulse
    gsap.fromTo(
      "#add-btn",
      { scale: 1 },
      { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut" }
    );

    // Animate the new todo itself
    setTimeout(() => {
      const item = document.getElementById(`todo-${newTodo.id}`);
      if (item) {
        gsap.fromTo(
          item,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      }
    }, 50);
  };

  const handleToggle = async (id) => {
    const todo = todos.find((t) => t.id === id);
    const updated = await updateTodo(id, { completed: !todo.completed });
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id) => {
    const item = document.getElementById(`todo-${id}`);
    if (item) {
      await gsap.to(item, {
        opacity: 0,
        x: 50,
        duration: 0.3,
        ease: "power2.in",
      });
    }
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const totalPages = Math.ceil(todos.length / todosPerPage);
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex justify-center p-6">
      <div className="w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden mt-6 flex flex-col">
        {/* Header + Input Section */}
        <div className="bg-yellow-100 px-6 py-5 border-b border-yellow-200">
          <h1 className="text-2xl font-extrabold text-yellow-700 mb-4 text-center">
            My To-Do List
          </h1>
          <form onSubmit={handleAdd} className="flex items-center gap-3">
            <div className="flex flex-col gap-3 flex-1">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task Title"
                className="border border-yellow-300 focus:ring-2 focus:ring-yellow-400 rounded-lg px-3 py-2 outline-none"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="border border-yellow-300 focus:ring-2 focus:ring-yellow-400 rounded-lg px-3 py-2 outline-none resize-none"
                rows={2}
              />
            </div>
            <button
              id="add-btn"
              className="bg-yellow-500 hover:bg-yellow-600 transition-colors text-white font-semibold px-4 py-2 rounded-lg shadow flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Todo List Section */}
        <div className="p-6 flex-1 overflow-y-auto max-h-full">
          <ul className="space-y-3">
            {currentTodos.length === 0 && (
              <li className="text-gray-500 text-center">No tasks yet ✨</li>
            )}
            {currentTodos.map((todo) => (
              <li
                key={todo.id}
                id={`todo-${todo.id}`}
                className="flex justify-between items-start bg-yellow-50 hover:bg-yellow-100 transition-colors px-4 py-3 rounded-lg shadow-sm"
              >
                <label
                  className="flex gap-3 items-start w-full cursor-pointer"
                  onClick={() => handleToggle(todo.id)}
                >
                  {todo.completed ? (
                    <CheckSquare className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Square className="w-5 h-5 text-yellow-600" />
                  )}
                  <div className="flex flex-col">
                    <span
                      className={
                        todo.completed
                          ? "line-through text-gray-400 font-medium"
                          : "text-yellow-900 font-semibold"
                      }
                    >
                      {todo.title}
                    </span>
                    {todo.description && (
                      <span className="text-gray-600 text-sm">
                        {todo.description}
                      </span>
                    )}
                  </div>
                </label>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-yellow-200 bg-yellow-50">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-yellow-200 hover:bg-yellow-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === i + 1
                    ? "bg-yellow-500 text-white"
                    : "bg-yellow-200 hover:bg-yellow-300"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-yellow-200 hover:bg-yellow-300 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
