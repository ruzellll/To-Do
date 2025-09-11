// src/App.jsx
import { useEffect, useState, useRef } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api/todos";
import gsap from "gsap";
import "./index.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    getTodos().then(setTodos).catch(console.error);
  }, []);

  // Animate todos when list changes
  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, [todos]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newTodo = await createTodo(text);
    setTodos([...todos, newTodo]);
    setText("");

    // Animate Add button pulse
    gsap.fromTo(
      "#add-btn",
      { scale: 1 },
      { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut" }
    );
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
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex justify-center p-6">
      <div className="w-full max-w-md max-h-[80vh] bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden mt-6 flex flex-col">
        {/* Header + Input Section */}
        <div className="bg-yellow-100 px-6 py-5 border-b border-yellow-200">
          <h1 className="text-2xl font-extrabold text-yellow-700 mb-4 text-center">
            🌟 My To-Do List
          </h1>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 border border-yellow-300 focus:ring-2 focus:ring-yellow-400 rounded-lg px-3 py-2 outline-none"
            />
            <button
              id="add-btn"
              className="bg-yellow-500 hover:bg-yellow-600 transition-colors text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Add
            </button>
          </form>
        </div>

        {/* Todo List Section with Scroll */}
        <div className="p-6 flex-1 overflow-y-auto max-h-full">
          <ul ref={listRef} className="space-y-3">
            {todos.length === 0 && (
              <li className="text-gray-500 text-center">No tasks yet ✨</li>
            )}
            {todos.map((todo) => (
              <li
                key={todo.id}
                id={`todo-${todo.id}`}
                className="flex justify-between items-center bg-yellow-50 hover:bg-yellow-100 transition-colors px-4 py-3 rounded-lg shadow-sm"
              >
                <label className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo.id)}
                    className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 rounded"
                  />
                  <span
                    className={
                      todo.completed
                        ? "line-through text-gray-400"
                        : "text-yellow-900 font-medium"
                    }
                  >
                    {todo.text}
                  </span>
                </label>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
