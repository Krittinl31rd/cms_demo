import React, { useState, useMemo, useEffect } from "react";

export default function DataTable({
  columns,
  data,
  filterComponent,
  rowsPerPageOptions = [5, 10, 20],
  enableSearch = true,
  onFilterChange,
}) {
  const [filterText, setFilterText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[1]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(() => setCurrentPage(1));
    }
  }, []);

  //  (filter by any column that is string or number)
  const filteredData = useMemo(() => {
    if (!filterText) return data;
    const lowercasedFilter = filterText?.toLowerCase();

    return data.filter((item) =>
      columns.some(({ accessor }) => {
        const value = item[accessor];
        if (value === undefined || value === null) return false;
        return value.toString().toLowerCase().includes(lowercasedFilter);
      })
    );
  }, [filterText, data, columns]);

  //  (sorting)
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        return sortConfig.direction === "asc"
          ? aVal.toString().localeCompare(bVal.toString())
          : bVal.toString().localeCompare(aVal.toString());
      }
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination data
  const totalRows = sortedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, rowsPerPage, sortedData]);
  const renderPageButtons = () => {
    const pages = [];
    const maxVisible = 5;

    const createButton = (pageNum) => (
      <button
        key={pageNum}
        onClick={() => gotoPage(pageNum)}
        className={`px-3 py-1 border border-gray-300 rounded ${
          pageNum === currentPage ? "bg-blue-500 text-white" : ""
        }`}
      >
        {pageNum}
      </button>
    );

    // Always show first page
    pages.push(createButton(1));

    // Show dots if needed
    if (currentPage > 3) {
      pages.push(
        <span key="start-ellipsis" className="px-2 text-gray-500">
          ...
        </span>
      );
    }

    // Show current ± 1 pages
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(createButton(i));
    }

    // Show dots if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <span key="end-ellipsis" className="px-2 text-gray-500">
          ...
        </span>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(createButton(totalPages));
    }

    return pages;
  };

  // Handle sort click
  function handleSort(key) {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  }

  // Handle page change
  function gotoPage(page) {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-4">
      <div
        className={`mb-2 flex flex-col sm:flex-row sm:items-center ${
          enableSearch ? "sm:justify-between" : "sm:justify-end"
        } gap-2`}
      >
        {enableSearch && (
          <input
            type="text"
            placeholder="Search..."
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-64 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <div className="flex items-center gap-2">
          <label htmlFor="rowsPerPage" className="text-gray-700 text-sm">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {rowsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/*  filterComponent  */}
      {filterComponent && <>{filterComponent}</>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {columns.map(({ header, accessor }) => (
                <th
                  key={accessor}
                  onClick={() => handleSort(accessor)}
                  className="cursor-pointer border-b border-gray-300 px-4 py-2 text-left text-sm font-semibold text-black select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {sortConfig.key === accessor && (
                      <svg
                        className={`w-3 h-3 text-gray-600 ${
                          sortConfig.direction === "asc" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 15l7-7 7 7"
                        ></path>
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-gray-500 py-6"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              currentData.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  {columns.map(({ accessor, cell }) => (
                    <td
                      key={accessor}
                      className="border-b border-gray-200 px-4 py-2 text-sm text-black whitespace-nowrap"
                    >
                      {cell
                        ? cell(row, idx, currentPage, rowsPerPage)
                        : row[accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-700 text-sm">
        <div>
          Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
          {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => gotoPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {renderPageButtons()}

          <button
            onClick={() => gotoPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
