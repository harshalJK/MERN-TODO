    import React, { useState } from 'react';

    export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.title);

    const handleSave = () => {
        const trimmed = value.trim();
        if (trimmed && trimmed !== task.title) onEdit(trimmed);
        setIsEditing(false);
    };

    return (
        <li className={`item ${task.completed ? 'done' : ''}`}>
        <input
            className="check"
            aria-label={`Mark ${task.title} complete`}
            type="checkbox"
            checked={task.completed}
            onChange={(e) => onToggle(e.target.checked)}
        />
        {isEditing ? (
            <input
            aria-label="Edit task"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            className="title"
            />
        ) : (
            <span className="title" onDoubleClick={() => setIsEditing(true)}>
            {task.title}
            </span>
        )}
        <div className="actions">
            {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-ghost" aria-label="Edit">
                Edit
            </button>
            )}
            <button onClick={onDelete} className="btn-ghost btn-danger" aria-label="Delete">
            Delete
            </button>
        </div>
        </li>
    );
    }
