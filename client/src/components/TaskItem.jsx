    import React, { useState } from 'react';

    export default function TaskItem({
    task,
    selected,
    onSelect,           // NEW: (checked:boolean) => void
    onToggle,
    onEdit,
    onDelete,
    onAddSubtask,       // NEW: (title:string) => void
    onToggleSubtask,    // NEW: (sid:string, completed:boolean) => void
    onDeleteSubtask     // NEW: (sid:string) => void
    }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.title);
    const [expanded, setExpanded] = useState(false);
    const [subTitle, setSubTitle] = useState('');

    const handleSave = () => {
        const trimmed = value.trim();
        if (trimmed && trimmed !== task.title) onEdit(trimmed);
        setIsEditing(false);
    };

    const dueLabel = task.dueAt ? new Date(task.dueAt).toLocaleDateString() : null;

    return (
        <li className={`item ${task.completed ? 'done' : ''}`}>
        <input
            type="checkbox"
            className="check"
            aria-label={`Select ${task.title}`}
            checked={!!selected}
            onChange={(e) => onSelect(e.target.checked)}
        />

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
            <div style={{ display: 'grid', gap: 4 }}>
            <span className="title" onDoubleClick={() => setIsEditing(true)}>{task.title}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {dueLabel && <span className="chip">{dueLabel}</span>}
                {Array.isArray(task.tags) && task.tags.map((t) => (
                <span key={t} className="chip">{t}</span>
                ))}
                {task.subtasks?.length > 0 && (
                <button className="btn-ghost" onClick={() => setExpanded((x) => !x)}>
                    {expanded ? 'Hide subtasks' : 'Show subtasks'}
                </button>
                )}
            </div>
            </div>
        )}

        <div className="actions">
            {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-ghost" aria-label="Edit">Edit</button>
            )}
            <button onClick={onDelete} className="btn-ghost btn-danger" aria-label="Delete">Delete</button>
        </div>

        {expanded && (
            <div style={{ gridColumn: '1 / -1', marginTop: 8, marginLeft: 40 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                {(task.subtasks || []).map((s) => (
                <li key={s._id} className={`item ${s.completed ? 'done' : ''}`} style={{ padding: 8 }}>
                    <input
                    type="checkbox"
                    className="check"
                    aria-label={`Mark subtask ${s.title} complete`}
                    checked={s.completed}
                    onChange={(e) => onToggleSubtask(s._id, e.target.checked)}
                    />
                    <span className="title" style={{ marginLeft: 8 }}>{s.title}</span>
                    <div className="actions">
                    <button className="btn-ghost btn-danger" onClick={() => onDeleteSubtask(s._id)}>Delete</button>
                    </div>
                </li>
                ))}
            </ul>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                placeholder="New subtask…"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && subTitle.trim() && (onAddSubtask(subTitle.trim()), setSubTitle(''))}
                />
                <button className="btn" type="button" onClick={() => subTitle.trim() && (onAddSubtask(subTitle.trim()), setSubTitle(''))}>
                Add subtask
                </button>
            </div>
            </div>
        )}
        </li>
    );
    }
