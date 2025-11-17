import { useMemo, useState } from 'react'

const PAGE_SIZE_OPTIONS = [5, 10, 15]

export const DataGrid = ({
  title,
  columns,
  rows,
  searchPlaceholder = 'Type to search',
  disableSortColumns = [],
  initialPageSize = 5,
  rowActions
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [page, setPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null })

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase()
    const base = rows.filter((row) =>
      columns.some((column) => {
        const value = column.accessor(row)
        return String(value ?? '').toLowerCase().includes(term)
      })
    )

    if (!sortConfig.column) return base
    return [...base].sort((a, b) => {
      const aVal = sortConfig.column.accessor(a)
      const bVal = sortConfig.column.accessor(b)
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  }, [columns, rows, searchTerm, sortConfig])

  const totalPages = Math.max(Math.ceil(filteredRows.length / pageSize), 1)
  const startIndex = (page - 1) * pageSize
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize)

  const handleSort = (column) => {
    if (disableSortColumns.includes(column.id)) return
    setPage(1)
    setSortConfig((prev) => {
      if (prev.column?.id === column.id) {
        const toggled =
          prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        return { column: toggled ? column : null, direction: toggled }
      }
      return { column, direction: 'asc' }
    })
  }

  return (
    <section className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">
            Sorting, pagination, and instant typeahead search are built-in.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500">
            Show
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(1)
              }}
              className="ml-2 rounded-lg border border-slate-200 text-sm px-2 py-1"
              data-testid="grid-page-size"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            rows
          </label>
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value)
              setPage(1)
            }}
            placeholder={searchPlaceholder}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            data-testid="grid-search"
          />
        </div>
      </header>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              {columns.map((column) => {
                const isActive = sortConfig.column?.id === column.id
                return (
                  <th
                    key={column.id}
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleSort(column)}
                  >
                    <span className="flex items-center gap-2">
                      {column.label}
                      {!disableSortColumns.includes(column.id) && (
                        <span className="text-brand-500 text-xs">
                          {isActive ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}
              {rowActions && <th className="px-4 py-3 text-slate-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedRows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.id} className="px-4 py-3">
                    {column.render ? column.render(row) : column.accessor(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">{rowActions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">
          Showing {(startIndex + 1).toString()} -{' '}
          {Math.min(startIndex + paginatedRows.length, filteredRows.length)} of{' '}
          {filteredRows.length} records
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="rounded-full border border-slate-200 px-4 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="rounded-full border border-slate-200 px-4 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  )
}

