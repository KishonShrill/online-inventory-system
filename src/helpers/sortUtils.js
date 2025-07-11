import { useState, useMemo } from "react";

export const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    // Memoize the sorted items to avoid re-calculating on every render
    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                // Access nested properties using the key
                const getNestedValue = (obj, key) => key.split('.').reduce((o, i) => (o ? o[i] : null), obj);

                const aValue = getNestedValue(a, sortConfig.key);
                const bValue = getNestedValue(b, sortConfig.key);

                // Handle different data types (string, number, date)
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    // Function to set the sorting configuration
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirectionClass = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return { items: sortedItems, requestSort, getSortDirectionClass };
};