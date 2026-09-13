import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Wrench } from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Brand } from '../components/Brand';

describe('StatusBadge and Pill Components', () => {
  it('renders status badges with appropriate labels', () => {
    const { rerender } = render(<StatusBadge status="open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();

    rerender(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(<StatusBadge status="resolved" />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders priority badge correctly and handles unassigned status', () => {
    const { rerender } = render(<PriorityBadge priority="urgent" />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();

    rerender(<PriorityBadge priority="unassigned" />);
    expect(screen.getByText('Review needed')).toBeInTheDocument();
  });

  it('renders category badge formatted label', () => {
    render(<CategoryBadge category="plumbing" />);
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
  });
});

describe('MetricCard Component', () => {
  it('renders metric label, value, and detail text', () => {
    render(
      <MetricCard
        label="Pending Repairs"
        value={14}
        detail="Requires technician dispatch"
        icon={Wrench}
        tone="bg-amber-100 text-amber-700"
      />
    );

    expect(screen.getByText('Pending Repairs')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Requires technician dispatch')).toBeInTheDocument();
  });
});

describe('Brand Component', () => {
  it('renders full brand text in standard mode', () => {
    render(<Brand compact={false} />);
    expect(screen.getByText('TenantPro')).toBeInTheDocument();
    expect(screen.getByText('Property operations')).toBeInTheDocument();
  });

  it('hides text in compact sidebar mode', () => {
    render(<Brand compact={true} />);
    expect(screen.queryByText('Property operations')).not.toBeInTheDocument();
  });
});
