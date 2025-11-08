"use server"

import type { FormData } from '../../lib/types';

const STORAGE_KEY = 'financialHealthChecks';

export const saveHealthCheck = (data: FormData): void => {
    try {
        const existingChecks = getHealthChecks();
        const updatedChecks = [...existingChecks, { ...data, submissionDate: new Date().toISOString() }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecks));
    } catch (error) {
        console.error("Error saving health check to localStorage:", error);
    }
};

export const getHealthChecks = (): (FormData & { submissionDate: string })[] => {
    try {
        const storedChecks = localStorage.getItem(STORAGE_KEY);
        return storedChecks ? JSON.parse(storedChecks) : [];
    } catch (error) {
        console.error("Error reading health checks from localStorage:", error);
        return [];
    }
};
