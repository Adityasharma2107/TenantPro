import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ContactPage } from '../pages/ContactPage';
import { LandingPage } from '../pages/LandingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { ThankYouPage } from '../pages/ThankYouPage';

describe('Public Marketing Pages Integration Suite', () => {
  it('renders LandingPage with hero headline and FAQs', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Property maintenance,/i)).toBeInTheDocument();
    expect(screen.getByText(/resolved in real time/i)).toBeInTheDocument();
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Get Started Free/i).length).toBeGreaterThan(0);
  });

  it('renders ContactPage with office details and inquiry form', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Get in touch with TenantPro/i)).toBeInTheDocument();
    expect(screen.getAllByText(/100 Panorama Way/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Send Inquiry/i)).toBeInTheDocument();
  });

  it('renders ThankYouPage with confirmation message', () => {
    render(
      <MemoryRouter>
        <ThankYouPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Thank you for contacting TenantPro!/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Home/i)).toBeInTheDocument();
  });

  it('renders PrivacyPolicyPage with data protection standards', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/TenantPro Privacy & Personal Data Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/12-Round BCrypt Hashing/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage with 404 message and return button', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Unit or Page Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Return Home/i)).toBeInTheDocument();
  });
});
