export const paginationData = (data, itemsPerPage, currentPage) => {
    const itemQuantity = data.length;
    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil((itemQuantity || 0) / itemsPerPage);

    return { paginatedData, totalPages, quantity: itemQuantity }
}