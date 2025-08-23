    import { render, screen, fireEvent, waitFor } from '@testing-library/react';
    import App from './src/App';
    import { vi } from 'vitest';
    import * as api from './src/api';

    vi.mock('./src/api');

    describe('To-Do App', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('adds a task and shows it', async () => {
        api.getTasks.mockResolvedValueOnce([]);
        api.createTask.mockResolvedValueOnce({ _id: '1', title: 'Write tests', completed: false });

        render(<App />);

        await waitFor(() => expect(api.getTasks).toHaveBeenCalled());

        const input = screen.getByPlaceholderText(/add a new task/i);
        const button = screen.getByRole('button', { name: /add/i });
        fireEvent.change(input, { target: { value: 'Write tests' } });
        fireEvent.click(button);

        await waitFor(() => expect(api.createTask).toHaveBeenCalledWith('Write tests'));
        expect(await screen.findByText('Write tests')).toBeInTheDocument();
    });

    test('marks a task complete', async () => {
        const task = { _id: '1', title: 'Learn MERN', completed: false };
        api.getTasks.mockResolvedValueOnce([task]);
        api.updateTask.mockResolvedValueOnce({ ...task, completed: true });

        render(<App />);

        await waitFor(() => expect(api.getTasks).toHaveBeenCalled());

        const checkbox = screen.getByRole('checkbox', { name: /mark learn mern complete/i });
        fireEvent.click(checkbox);

        await waitFor(() => expect(api.updateTask).toHaveBeenCalledWith('1', { completed: true }));
        expect(checkbox).toBeChecked();
    });
    });
