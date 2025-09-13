// src/App.jsx
import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api/todos";
import gsap from "gsap";
import {
  Plus,
  Trash2,
  Square,
  CheckSquare,
  Pencil,
  X,
  Check,
} from "lucide-react";
import "./index.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [filter, setFilter] = useState("All"); // 🔥 New filter state

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

    gsap.fromTo(
      "#add-btn",
      { scale: 1 },
      { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut" }
    );

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

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveUpdate = async (id) => {
    if (!editTitle.trim()) return;
    const updated = await updateTodo(id, {
      title: editTitle,
      description: editDescription,
    });
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
    cancelEditing();
  };

  // 🔥 Filtering logic
  const filteredTodos = todos.filter((todo) => {
    if (filter === "Completed") return todo.completed;
    if (filter === "Uncompleted") return !todo.completed;
    return true; // "All"
  });

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

        {/* 🔥 Filter Controls */}
        <div className="flex justify-center gap-3 p-4 border-b border-yellow-200 bg-yellow-50">
          {["All", "Completed", "Uncompleted"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-200 hover:bg-yellow-300 text-yellow-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todo List Section */}
        <div className="p-6 flex-1 overflow-y-auto max-h-full">
          <ul className="space-y-3">
            {filteredTodos.length === 0 && (
              <li className="text-gray-500 text-center">No tasks found</li>
            )}
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                id={`todo-${todo.id}`}
                className="flex justify-between items-start bg-yellow-50 hover:bg-yellow-100 transition-colors px-4 py-3 rounded-lg shadow-sm"
              >
                {editingId === todo.id ? (
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border border-yellow-300 rounded-lg px-3 py-2 outline-none"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="border border-yellow-300 rounded-lg px-3 py-2 outline-none resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveUpdate(todo.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-lg flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label
                      className="flex gap-3 items-start w-full cursor-pointer"
                      onClick={() => handleToggle(todo.id)}
                    >
                      {todo.completed ? (
                        <CheckSquare className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <Square className="w-5 h-5 text-yellow-600" />
                      )}
                      <div className="flex flex-col break-words max-w-[220px] sm:max-w-[260px] md:max-w-[300px]">
                        <span
                          className={
                            todo.completed
                              ? "line-through text-gray-400 font-medium break-words"
                              : "text-yellow-900 font-semibold break-words"
                          }
                        >
                          {todo.title}
                        </span>
                        {todo.description && (
                          <span className="text-gray-600 text-sm break-words">
                            {todo.description}
                          </span>
                        )}
                      </div>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(todo)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
