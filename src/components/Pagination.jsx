import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pagination = ({ setCurrentPage, currentPage, totalPages, quantity }) => {
    // Hide pagination if there are 7 or fewer items, or only 1 page
    if (quantity <= 7 || totalPages <= 1) return null;

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-2 lg:px-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 transition-colors"
            >
                <ChevronLeft className="h-4 w-4 lg:mr-1" />
                <span className="hidden lg:inline-block">Previous</span>
            </Button>

            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 px-2 min-w-[100px] text-center">
                Page <span className="text-slate-900 dark:text-slate-100">{currentPage}</span> of <span className="text-slate-900 dark:text-slate-100">{totalPages}</span>
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 px-2 lg:px-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 transition-colors"
            >
                <span className="hidden lg:inline-block">Next</span>
                <ChevronRight className="h-4 w-4 lg:ml-1" />
            </Button>
        </div>
    );
}

Pagination.displayName = "Pagination";

Pagination.propTypes = {
    setCurrentPage: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
};

export default Pagination;
