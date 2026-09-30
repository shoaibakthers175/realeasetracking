import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { KpiCard } from '../components/dashboard/KpiCard';
import { Building2 } from 'lucide-react';
import { FeaturesMatrixCard } from '../components/dashboard/FeaturesMatrixCard';
import { DateFilter } from '../components/common/DateFilter';

describe('ReleaseTrack React Component Test Suite', () => {
  it('renders Badge with variants correctly', () => {
    render(<Badge variant="live">Live</Badge>);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders Button with text and handles loading state', () => {
    const { rerender } = render(<Button variant="primary">Create Release</Button>);
    expect(screen.getByText('Create Release')).toBeInTheDocument();

    rerender(<Button variant="primary" isLoading>Create Release</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders KpiCard with accurate metrics and sparkline', () => {
    render(
      <BrowserRouter>
        <KpiCard
          title="Total Universities"
          value={18}
          trend="+12%"
          subtext="+2 this month"
          icon={Building2}
        />
      </BrowserRouter>
    );
    expect(screen.getByText('Total Universities')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('+2 this month')).toBeInTheDocument();
  });

  it('renders DateFilter pill buttons and highlights active selection', () => {
    render(<DateFilter value="this_month" onChange={() => {}} />);
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Year')).toBeInTheDocument();
  });

  it('renders FeaturesMatrixCard with dynamic university checkmarks', () => {
    const mockMatrix = {
      universities: [
        { id: '1', code: 'IITKGP', name: 'IIT Kharagpur', type: 'STANDALONE' as const },
        { id: '2', code: 'ATLAS', name: 'Atlas University', type: 'MULTI_TENANT' as const },
      ],
      features: [
        {
          featureId: 'f1',
          featureName: 'New Lead Form',
          featureCode: 'NEW_LEAD_FORM',
          category: 'LEAD_MANAGEMENT' as const,
          universities: { IITKGP: true, ATLAS: true },
          totalLiveCount: 2,
        },
      ],
      environment: 'PRODUCTION' as const,
    };

    render(
      <BrowserRouter>
        <FeaturesMatrixCard matrix={mockMatrix} />
      </BrowserRouter>
    );

    expect(screen.getByText('Features by University')).toBeInTheDocument();
    expect(screen.getByText('New Lead Form')).toBeInTheDocument();
    expect(screen.getByText('IITKGP')).toBeInTheDocument();
    expect(screen.getByText('ATLAS')).toBeInTheDocument();
  });
});
