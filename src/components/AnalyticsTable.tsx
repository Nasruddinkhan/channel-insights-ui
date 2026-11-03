import { useState } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import type { AnalyticsRow } from '../types';
const columns: { key: keyof AnalyticsRow; label: string }[] = [
  { key: 'name', label: 'Feature' },
  { key: 'web', label: 'Web Requests' },
  { key: 'mobile', label: 'Mobile Requests' },
  { key: 'total', label: 'Total Requests' },
  { key: 'employees', label: 'Unique Employees' },
  { key: 'share', label: 'Mobile Share' },
];
export function AnalyticsTable({
  rows,
  department = false,
  filterKey,
}: {
  rows: AnalyticsRow[];
  department?: boolean;
  filterKey: string;
}) {
  const [sort, setSort] = useState<keyof AnalyticsRow>('total');
  const [asc, setAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const sorted = [...rows].sort((a, b) => {
    const firstValue = a[sort];
    const secondValue = b[sort];
    const comparison =
      typeof firstValue === 'string'
        ? firstValue.localeCompare(String(secondValue))
        : firstValue - Number(secondValue);
    return asc ? comparison : -comparison;
  });
  const safePage = Math.min(page, Math.max(0, Math.ceil(rows.length / size) - 1));
  function exportCsv() {
    const headers = columns.map((column) =>
      column.key === 'name' && department ? 'Department' : column.label,
    );
    const values = sorted.map((row) =>
      columns.map((column) =>
        column.key === 'share' ? `${row.share.toFixed(1)}%` : row[column.key],
      ),
    );
    const csv = [headers, ...values]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(
      new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }),
    );
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `channel-insights-${filterKey}.csv`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="table-panel">
      <div className="table-heading">
        <div>
          <h2>{department ? 'Department comparison' : 'Feature breakdown'}</h2>
          <p>Request volume and channel adoption at a glance</p>
        </div>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<FileDownloadOutlined />}
          onClick={exportCsv}
        >
          Export CSV
        </Button>
      </div>
      <TableContainer>
        <Table size="medium" aria-label={department ? 'Department comparison' : 'Feature details'}>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  sortDirection={sort === c.key ? (asc ? 'asc' : 'desc') : false}
                  align={c.key === 'name' ? 'left' : 'right'}
                >
                  <TableSortLabel
                    active={sort === c.key}
                    direction={asc ? 'asc' : 'desc'}
                    onClick={() => {
                      setAsc(sort === c.key ? !asc : false);
                      setSort(c.key);
                      setPage(0);
                    }}
                  >
                    {c.key === 'name' && department ? 'Department' : c.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.slice(safePage * size, (safePage + 1) * size).map((r) => (
              <TableRow key={r.name}>
                <TableCell className="row-name">{r.name}</TableCell>
                <TableCell align="right">
                  <span className="web-number">{r.web.toLocaleString()}</span>
                </TableCell>
                <TableCell align="right">
                  <span className="mobile-number">{r.mobile.toLocaleString()}</span>
                </TableCell>
                <TableCell align="right">
                  <strong>{r.total.toLocaleString()}</strong>
                </TableCell>
                <TableCell align="right">{r.employees.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <span className="share-cell">
                    <span className="share-track">
                      <span style={{ width: `${r.share}%` }} />
                    </span>
                    {r.share.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No requests match the applied filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={safePage}
        rowsPerPage={size}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setSize(Number(e.target.value));
          setPage(0);
        }}
      />
    </section>
  );
}
