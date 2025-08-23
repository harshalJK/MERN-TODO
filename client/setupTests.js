    // client/setupTests.js
    import { expect, afterEach, vi } from 'vitest';
    import { cleanup } from '@testing-library/react';
    import * as matchers from '@testing-library/jest-dom/matchers';

    // Extend Vitest's expect with jest-dom matchers (toBeInTheDocument, etc.)
    expect.extend(matchers);

    // Clean up the DOM and mocks after each test
    afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    });
