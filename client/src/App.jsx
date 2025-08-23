import React, { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './api';
import TaskItem from './components/TaskItem.jsx';
import './index.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = await createTask(title.trim());
    setTasks((prev) => [newTask, ...prev]);
    setTitle('');
  };

  const toggleComplete = async (id, completed) => {
    const updated = await updateTask(id, { completed });
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const editTitle = async (id, newTitle) => {
    const updated = await updateTask(id, { title: newTitle });
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const remove = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="container">
      <h1>MERN To-Do</h1>

      <form onSubmit={handleAdd} className="add-form">
        <input
          aria-label="Task title"
          placeholder="Add a new task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <div role="alert" className="error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul className="list">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={(completed) => toggleComplete(task._id, completed)}
              onEdit={(newTitle) => editTitle(task._id, newTitle)}
              onDelete={() => remove(task._id)}
            />
          ))}
          {tasks.length === 0 && <p className="empty">No tasks yet. Add one!</p>}
        </ul>
      )}
    </div>
  );
}
