import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders layout container', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('relative', 'flex', 'min-h-screen');
  });

  it('renders children content', () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders background color classes', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-brand-600');
  });

  it('centers content vertically and horizontally', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('items-center', 'justify-center');
  });

  it('renders decorative SVG', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('marks SVG as decorative', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders SVG with correct viewBox', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 586 754');
  });

  it('renders both decorative rectangles in SVG', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(2);
  });

  it('applies padding to container', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('px-4');
  });

  it('handles overflow hidden', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('overflow-hidden');
  });

  it('renders content div with proper styling', () => {
    const { container } = render(
      <AuthLayout>
        <div data-testid="auth-content">Content</div>
      </AuthLayout>
    );
    const contentDiv = container.querySelector('[data-testid="auth-content"]')?.parentElement;
    expect(contentDiv).toHaveClass(
      'relative',
      'z-10',
      'flex',
      'w-full',
      'max-w-lg',
      'justify-center'
    );
  });

  it('renders with complex children', () => {
    render(
      <AuthLayout>
        <div>
          <h1>Auth Page</h1>
          <form>
            <input type="email" placeholder="Email" />
          </form>
        </div>
      </AuthLayout>
    );
    expect(screen.getByText('Auth Page')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('renders full screen height', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('min-h-screen');
  });

  it('renders SVG with namespace', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });

  it('renders SVG with fill attribute', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('renders layout with multiple content elements', () => {
    render(
      <AuthLayout>
        <div>
          <p>Section 1</p>
          <p>Section 2</p>
        </div>
      </AuthLayout>
    );
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('applies flex column layout', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex-col');
  });

  it('renders children in a responsive container', () => {
    const { container } = render(
      <AuthLayout>
        <div className="w-full">Content</div>
      </AuthLayout>
    );
    const contentWrapper = container.querySelector('.w-full');
    expect(contentWrapper).toBeInTheDocument();
  });

  it('positions content absolutely above decorative shapes', () => {
    const { container } = render(
      <AuthLayout>
        <div data-testid="main-content">Content</div>
      </AuthLayout>
    );
    const contentDiv = container.querySelector('[data-testid="main-content"]')?.parentElement;
    expect(contentDiv).toHaveClass('relative', 'z-10');
  });

  it('renders decorative shapes in absolute position', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const shapesDiv = container.querySelector('.absolute.inset-0');
    expect(shapesDiv).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    const { container } = render(
      <AuthLayout>
        <div></div>
      </AuthLayout>
    );
    expect(container).toBeInTheDocument();
  });
});
