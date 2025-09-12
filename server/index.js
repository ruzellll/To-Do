// server/index.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies

// In-memory store
let todos = [];
let nextId = 1;

// ✅ GET all todos
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

// ✅ POST new todo
app.post("/api/todos", (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTodo = {
    id: nextId++,
    title,
    description: description || "",
    completed: false,
  };
  todos.push(newTodo);

  res.status(201).json(newTodo);
});

// ✅ PUT update todo
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const todo = todos.find((t) => t.id === parseInt(id));
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  if (title !== undefined) todo.title = title;
  if (description !== undefined) todo.description = description;
  if (completed !== undefined) todo.completed = completed;

  res.json(todo);
});

// ✅ DELETE a todo
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;

  const index = todos.findIndex((t) => t.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const deleted = todos.splice(index, 1);
  res.json(deleted[0]);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ To-Do API running at http://localhost:${PORT}`);
});
