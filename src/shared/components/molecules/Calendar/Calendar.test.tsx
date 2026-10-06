import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  it('renders 5 weeks for March 2026', () => {
    render(<Calendar currentDate="2026-03-01" events={[]} showOutsideDays />);

    expect(screen.getAllByTestId('calendar-day-cell')).toHaveLength(35);
  });

  it('renders 6 weeks for August 2026', () => {
    render(<Calendar currentDate="2026-08-01" events={[]} showOutsideDays />);

    expect(screen.getAllByTestId('calendar-day-cell')).toHaveLength(42);
  });
});
