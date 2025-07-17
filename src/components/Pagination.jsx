import PropTypes from "prop-types"
import '../styles/components/_pagination.scss'

const Pagination = ({ setCurrentPage, currentPage, totalPages, quantity }) => {
    if (quantity <= 7) return;

    return (
        <div className="pagination">
            <button
                id="prevPageBtn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                &laquo; Previous
            </button>
            <span>
                Page<span id="currentPageSpan">{currentPage}</span>of
                <span id="totalPagesSpan">{totalPages}</span>
            </span>
            <button
                id="nextPageBtn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Next &raquo;
            </button>
        </div>
    )
}


// 👇 Give the component a name for debugging purposes
Pagination.displayName = "Pagination"

// 👇 Define PropTypes
Pagination.propTypes = {
    setCurrentPage: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
}

export default Pagination