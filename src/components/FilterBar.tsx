import { useState } from 'react';
import { Button, MenuItem, TextField } from '@mui/material';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import RestartAlt from '@mui/icons-material/RestartAlt';
import type { Filters } from '../types';
import { DEMO_END, departments } from '../data/events';
import { shiftDate } from '../utils/analytics';
export const defaultFilters: Filters = {
  start: shiftDate(DEMO_END, -29),
  end: DEMO_END,
  department: 'ALL',
  channel: 'ALL',
};
const quickRanges = [
  { label: 'Last 7 Days', start: shiftDate(DEMO_END, -6) },
  { label: 'Last 30 Days', start: shiftDate(DEMO_END, -29) },
  { label: 'This Month', start: DEMO_END.slice(0, 7) + '-01' },
];

export function FilterBar({
  onApply,
  initialFilters = defaultFilters,
}: {
  onApply: (f: Filters) => void;
  initialFilters?: Filters;
}) {
  const [draft, setDraft] = useState(initialFilters);
  const [quick, setQuick] = useState(
    quickRanges.find(
      (range) => range.start === initialFilters.start && initialFilters.end === DEMO_END,
    )?.label ?? '',
  );
  const invalid = !draft.start || !draft.end || draft.start > draft.end;
  function select(range: (typeof quickRanges)[number]) {
    setQuick(range.label);
    setDraft({ ...draft, start: range.start, end: DEMO_END });
  }
  return (
    <section className="filter-panel" aria-label="Analytics filters">
      <div className="filter-heading">
        <span>
          <FilterAltOutlined fontSize="small" /> Filter analytics
        </span>
        <div className="quick-dates">
          {quickRanges.map((range) => (
            <button
              key={range.label}
              className={quick === range.label ? 'selected' : ''}
              onClick={() => select(range)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-fields">
        <TextField
          label="From date"
          type="date"
          size="small"
          value={draft.start}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => {
            setQuick('');
            setDraft({ ...draft, start: e.target.value });
          }}
        />
        <TextField
          label="To date"
          type="date"
          size="small"
          value={draft.end}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => {
            setQuick('');
            setDraft({ ...draft, end: e.target.value });
          }}
        />
        <TextField
          select
          label="Department"
          size="small"
          value={draft.department}
          onChange={(e) => setDraft({ ...draft, department: e.target.value })}
        >
          <MenuItem value="ALL">All departments</MenuItem>
          {departments.map((name, i) => (
            <MenuItem key={name} value={String(i)}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Channel"
          size="small"
          value={draft.channel}
          onChange={(e) => setDraft({ ...draft, channel: e.target.value as Filters['channel'] })}
        >
          {['ALL', 'WEB', 'MOBILE'].map((c) => (
            <MenuItem key={c} value={c}>
              {c === 'ALL' ? 'All channels' : c === 'WEB' ? 'Web' : 'Mobile'}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" disabled={invalid} onClick={() => onApply(draft)}>
          Apply filters
        </Button>
        <Button
          color="inherit"
          startIcon={<RestartAlt />}
          onClick={() => {
            setDraft(defaultFilters);
            setQuick('Last 30 Days');
            onApply(defaultFilters);
          }}
        >
          Reset
        </Button>
      </div>
      {invalid && <p role="alert">Select a valid date range. The end must follow the start.</p>}
    </section>
  );
}
