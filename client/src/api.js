    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    export async function getTasks() {
    const res = await fetch(`${BASE}/api/tasks`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
    }

    export async function createTask(title) {
    const res = await fetch(`${BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error('Failed to create');
    return res.json();
    }

    export async function updateTask(id, data) {
    const res = await fetch(`${BASE}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update');
    return res.json();
    }

    export async function deleteTask(id) {
    const res = await fetch(`${BASE}/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    }
