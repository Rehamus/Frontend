import React from 'react';
import PropTypes from 'prop-types';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageClick }) => {
    const pageNumbers = [];
    const maxPageButtons = 8;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination">
            {startPage > 1 && <button onClick={() => onPageClick(currentPage - 1)} className="page-link">이전</button>}
            {pageNumbers.map(pageNumber => (
                <button
                    key={pageNumber}
                    onClick={() => onPageClick(pageNumber)}
                    className={`page-link ${currentPage === pageNumber ? 'active' : ''}`}
                >
                    {pageNumber}
                </button>
            ))}
            {endPage < totalPages && <button onClick={() => onPageClick(currentPage + 1)} className="page-link">다음</button>}
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageClick: PropTypes.func.isRequired,
};

export default Pagination;
