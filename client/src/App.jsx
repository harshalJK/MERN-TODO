import React, { useEffect, useMemo, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './api';
import TaskItem from './components/TaskItem.jsx';
import './index.css';

const FILTERS = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const visible = useMemo(() => tasks.filter(FILTERS[filter]), [tasks, filter]);
  const activeCount = tasks.filter((t) => !t.completed).length;

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

  const clearCompleted = async () => {
    // optimistic: remove completed from UI, server will actually delete via loop
    const toDelete = tasks.filter((t) => t.completed);
    await Promise.all(toDelete.map((t) => deleteTask(t._id)));
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <span className="badge">MERN</span>
          <h1>MERN To-Do</h1>
        </div>
        <span className="meta">{activeCount} {activeCount === 1 ? 'task' : 'tasks'} left</span>
      </div>

      <form onSubmit={handleAdd} className="add-form">
        <input
          aria-label="Task title"
          placeholder="Add a new task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn" type="submit">Add</button>
      </form>

      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="Filters">
          {['all','active','completed'].map((key) => (
            <button
              key={key}
              type="button"
              className={`chip ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
              aria-selected={filter === key}
              role="tab"
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div className="filters">
          <button className="link" type="button" onClick={clearCompleted}>
            Clear completed
          </button>
        </div>
      </div>

      {error && <div role="alert" className="error">{error}</div>}
      {loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <ul className="list">
          {visible.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={(completed) => toggleComplete(task._id, completed)}
              onEdit={(newTitle) => editTitle(task._id, newTitle)}
              onDelete={() => remove(task._id)}
            />
          ))}
          {visible.length === 0 && <p className="empty">No tasks here. Add one!</p>}
        </ul>
      )}
    </div>
  );
}
