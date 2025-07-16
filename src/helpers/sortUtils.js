import { useState, useMemo } from "react";

export const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const getNestedValue = (obj, key) => key.split('.').reduce((o, i) => o?.[i], obj);
                
                // console.log(`${JSON.stringify(a)} || ${sortConfig.key}`)
                const aValue = (getNestedValue(a, sortConfig.key) ?? '').toString().toLowerCase();
                const bValue = (getNestedValue(b, sortConfig.key) ?? '').toString().toLowerCase();

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirectionClass = (name) => {
        return sortConfig?.key === name ? sortConfig.direction : '';
    }

    return { items: sortedItems, requestSort, getSortDirectionClass };
};