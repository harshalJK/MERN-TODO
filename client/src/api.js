    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    export async function getTasks({ query = '', tag = '', completed, sort = 'newest' } = {}) {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (tag) params.set('tag', tag);
    if (typeof completed !== 'undefined') params.set('completed', String(completed));
    if (sort) params.set('sort', sort);
    const res = await fetch(`${BASE}/api/tasks?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
    }

    export async function createTask(payload) {
    // payload: { title, dueAt?, tags?, subtasks? }
    const res = await fetch(`${BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

    export async function bulkComplete(ids, completed) {
    const res = await fetch(`${BASE}/api/tasks/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, completed })
    });
    if (!res.ok) throw new Error('Failed to bulk complete');
    return res.json();
    }

    export async function bulkDelete(ids) {
    const res = await fetch(`${BASE}/api/tasks/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error('Failed to bulk delete');
    }

    export async function addSubtask(taskId, title) {
    const res = await fetch(`${BASE}/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error('Failed to add subtask');
    return res.json();
    }

    export async function updateSubtask(taskId, subtaskId, data) {
    const res = await fetch(`${BASE}/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update subtask');
    return res.json();
    }

    export async function deleteSubtask(taskId, subtaskId) {
    const res = await fetch(`${BASE}/api/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete subtask');
    }
