  import React, { useEffect, useMemo, useState } from 'react';
  import {
    getTasks, createTask, updateTask, deleteTask,
    bulkComplete, bulkDelete,
    addSubtask, updateSubtask, deleteSubtask
  } from './api';
  import TaskItem from './components/TaskItem.jsx';
  import './index.css';

  const FILTERS = {
    all: () => true,
    active: (t) => !t.completed,
    completed: (t) => t.completed,
  };

  const SORTS = [
    { key: 'dueSoonest', label: 'Due soonest' },
    { key: 'dueLatest',  label: 'Due latest' },
    { key: 'newest',     label: 'Newest' },
    { key: 'oldest',     label: 'Oldest' },
  ];

  function useDebounce(value, ms) {
    const [v, setV] = useState(value);
    useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
    return v;
  }

  export default function App() {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');

    // Add form state
    const [title, setTitle] = useState('');
    const [dueAt, setDueAt] = useState('');          // yyyy-mm-dd
    const [tagInput, setTagInput] = useState('');     // comma-separated

    // Query state
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [activeTag, setActiveTag] = useState('');
    const [sort, setSort] = useState('dueSoonest');

    // Selection for bulk actions
    const [selected, setSelected] = useState({}); // { [id]: true }

    const visible = useMemo(
      () => tasks.filter(FILTERS[filter]).filter(t => !activeTag || t.tags?.includes(activeTag)),
      [tasks, filter, activeTag]
    );
    const activeCount = tasks.filter((t) => !t.completed).length;

    const allTags = useMemo(() => {
      const set = new Set();
      tasks.forEach(t => (t.tags || []).forEach(tag => set.add(tag)));
      return Array.from(set).sort();
    }, [tasks]);

    // Load from server with search/sort/tag
    const load = async () => {
      const data = await getTasks({
        query: debouncedQuery,
        tag: activeTag,
        sort
      });
      setTasks(data);
      setSelected({});
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [debouncedQuery, activeTag, sort]);

    // Create
    const handleAdd = async (e) => {
      e.preventDefault();
      if (!title.trim()) return;
      const payload = { title: title.trim() };
      if (dueAt) payload.dueAt = dueAt;
      const tags = tagInput.split(',').map(s => s.trim()).filter(Boolean);
      if (tags.length) payload.tags = tags;
      const newTask = await createTask(title.trim());
      setTasks(prev => [newTask, ...prev]);
      setTitle(''); setDueAt(''); setTagInput('');
    };

    // Update single
    const toggleComplete = async (id, completed) => {
      const updated = await updateTask(id, { completed });
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    };
    const editTitle = async (id, newTitle) => {
      const updated = await updateTask(id, { title: newTitle });
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    };
    const remove = async (id) => {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      setSelected(prev => { const c = { ...prev }; delete c[id]; return c; });
    };

    // Subtasks
    const onAddSubtask = async (id, subTitle) => {
      const updated = await addSubtask(id, subTitle);
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    };
    const onToggleSubtask = async (id, sid, completed) => {
      const updated = await updateSubtask(id, sid, { completed });
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    };
    const onDeleteSubtask = async (id, sid) => {
      await deleteSubtask(id, sid);
      // Pull fresh task
      const fresh = await getTasks({ query: '', tag: '', sort: 'newest' });
      setTasks(fresh);
    };

    // Bulk
    const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected]);
    const anySelected = selectedIds.length > 0;

    const bulkMark = async (completed) => {
      await bulkComplete(selectedIds, completed);
      setTasks(prev => prev.map(t => selectedIds.includes(t._id) ? { ...t, completed } : t));
      setSelected({});
    };
    const bulkTrash = async () => {
      await bulkDelete(selectedIds);
      setTasks(prev => prev.filter(t => !selectedIds.includes(t._id)));
      setSelected({});
    };

    // Clear completed (single click utility)
    const clearCompleted = async () => {
      const ids = tasks.filter(t => t.completed).map(t => t._id);
      if (!ids.length) return;
      await bulkDelete(ids);
      setTasks(prev => prev.filter(t => !t.completed));
    };

    return (
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="brand">
            <span className="badge">MERN</span>
            <h1>MERN To-Do</h1>
          </div>
          <span className="meta">{activeCount} {activeCount === 1 ? 'task' : 'tasks'} left</span>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="add-form" style={{ gridTemplateColumns: '1.2fr .9fr .9fr auto' }}>
          <input
            aria-label="Task title"
            placeholder="Add a new task…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            aria-label="Due date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            title="Due date"
          />
          <input
            aria-label="Tags (comma separated)"
            placeholder="tags (e.g. work, urgent)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
          <button className="btn" type="submit">Add</button>
        </form>

        {/* Toolbar: search + sort + filters + bulk */}
        <div className="toolbar" style={{ gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              aria-label="Search"
              placeholder="Search tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ height: 40, padding: '0 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.03)', color: 'inherit' }}
            />
            <select
              aria-label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.03)', color: 'inherit', padding: '0 12px' }}
            >
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

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

          <div className="filters" role="tablist" aria-label="Tag filters">
            <button className={`chip ${activeTag === '' ? 'active' : ''}`} onClick={() => setActiveTag('')}>All tags</button>
            {allTags.map(t => (
              <button key={t} className={`chip ${activeTag === t ? 'active' : ''}`} onClick={() => setActiveTag(t)}>{t}</button>
            ))}
          </div>

          <div className="filters">
            <button className="chip" disabled={!anySelected} onClick={() => bulkMark(true)}>Complete selected</button>
            <button className="chip" disabled={!anySelected} onClick={() => bulkMark(false)}>Uncomplete selected</button>
            <button className="link" disabled={!anySelected} onClick={bulkTrash}>Delete selected</button>
            <button className="link" onClick={clearCompleted}>Clear completed</button>
          </div>
        </div>

        {/* List */}
        <ul className="list">
          {visible.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              selected={!!selected[task._id]}
              onSelect={(checked) => setSelected(prev => ({ ...prev, [task._id]: checked }))}
              onToggle={(completed) => toggleComplete(task._id, completed)}
              onEdit={(newTitle) => editTitle(task._id, newTitle)}
              onDelete={() => remove(task._id)}
              onAddSubtask={(subTitle) => onAddSubtask(task._id, subTitle)}
              onToggleSubtask={(sid, c) => onToggleSubtask(task._id, sid, c)}
              onDeleteSubtask={(sid) => onDeleteSubtask(task._id, sid)}
            />
          ))}
          {visible.length === 0 && <p className="empty">No tasks match. Try clearing filters or search.</p>}
        </ul>
      </div>
    );
  }
