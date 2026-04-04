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
                className="h-8 px-2 lg:px-3 bg-white text-slate-600 hover:text-slate-900 border-slate-200"
            >
                <ChevronLeft className="h-4 w-4 lg:mr-1" />
                <span className="hidden lg:inline-block">Previous</span>
            </Button>

            <div className="text-sm font-medium text-slate-600 px-2 min-w-[100px] text-center">
                Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 px-2 lg:px-3 bg-white text-slate-600 hover:text-slate-900 border-slate-200"
            >
                <span className="hidden lg:inline-block">Next</span>
                <ChevronRight className="h-4 w-4 lg:ml-1" />
            </Button>
        </div>
    );
}

Pagination.displayName = "Pagination";

Pagination.propTypes = {
    setCurrentPage: PropTypes.func.isRequired, // Changed from .number to .func based on usage
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
};

export default Pagination;
