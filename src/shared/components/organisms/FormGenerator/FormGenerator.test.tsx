import { render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { FormGenerator } from './FormGenerator';

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: (schema: z.ZodSchema) => (data: any) => {
    try {
      schema.parse(data);
      return { values: data, errors: {} };
    } catch (error: any) {
      return {
        values: {},
        errors: Object.fromEntries(error.errors.map((e: any) => [e.path[0], e.message])),
      };
    }
  },
}));

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    handleSubmit: (onSubmit: any) => (e: any) => {
      e.preventDefault();
      onSubmit({});
    },
    watch: vi.fn(),
    formState: { errors: {} },
  })),
  FormProvider: ({ children }: any) => <div data-testid="form-provider">{children}</div>,
  useFormContext: vi.fn(() => ({
    register: vi.fn(),
    watch: vi.fn(),
    formState: { errors: {} },
  })),
}));

vi.mock('./FormFieldRenderer', () => ({
  FormFieldRenderer: ({ field }: any) => (
    <div data-testid={`field-${field.name || field.type}`} data-type={field.type}>
      {field.label}
    </div>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('FormGenerator', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
  });

  const testFields = [
    {
      name: 'name' as const,
      type: 'text' as const,
      label: 'Name',
      colSpan: 6 as const,
    },
    {
      name: 'email' as const,
      type: 'email' as const,
      label: 'Email',
      colSpan: 6 as const,
    },
  ] as any[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form provider', () => {
    render(
      <FormGenerator id="test-form" schema={testSchema} fields={testFields} onSubmit={vi.fn()} />
    );
    expect(screen.getByTestId('form-provider')).toBeInTheDocument();
  });

  it('renders form element with id', () => {
    const { container } = render(
      <FormGenerator id="my-form" schema={testSchema} fields={testFields} onSubmit={vi.fn()} />
    );
    const form = container.querySelector('form[id="my-form"]');
    expect(form).toBeInTheDocument();
  });

  it('renders all fields', () => {
    render(
      <FormGenerator id="test-form" schema={testSchema} fields={testFields} onSubmit={vi.fn()} />
    );
    expect(screen.getByTestId('field-name')).toBeInTheDocument();
    expect(screen.getByTestId('field-email')).toBeInTheDocument();
  });

  it('renders field labels', () => {
    render(
      <FormGenerator id="test-form" schema={testSchema} fields={testFields} onSubmit={vi.fn()} />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('applies grid column spans to fields', () => {
    const { container } = render(
      <FormGenerator
        id="test-form"
        schema={testSchema}
        fields={[
          { name: 'name' as const, type: 'text' as const, label: 'Field 1', colSpan: 6 },
          { name: 'email' as const, type: 'email' as const, label: 'Field 2', colSpan: 12 },
        ]}
        onSubmit={vi.fn()}
      />
    );
    const divs = container.querySelectorAll('form > div');
    expect(divs[0].className).toContain('col-span-6');
    expect(divs[1].className).toContain('col-span-12');
  });

  it('renders with default colSpan when not specified', () => {
    const { container } = render(
      <FormGenerator
        id="test-form"
        schema={testSchema}
        fields={[{ name: 'name' as const, type: 'text' as const, label: 'Field 1' }]}
        onSubmit={vi.fn()}
      />
    );
    const fieldDiv = container.querySelector('form > div');
    expect(fieldDiv?.className).toContain('col-span-12');
  });

  it('renders actions in full width column when provided', () => {
    render(
      <FormGenerator
        id="test-form"
        schema={testSchema}
        fields={testFields}
        onSubmit={vi.fn()}
        actions={
          <button type="submit" data-testid="submit-btn">
            Submit
          </button>
        }
      />
    );
    expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
  });

  it('does not render actions when not provided', () => {
    render(
      <FormGenerator id="test-form" schema={testSchema} fields={testFields} onSubmit={vi.fn()} />
    );
    expect(screen.queryByTestId('submit-btn')).not.toBeInTheDocument();
  });

  it('applies custom className to form', () => {
    const { container } = render(
      <FormGenerator
        id="test-form"
        schema={testSchema}
        fields={testFields}
        onSubmit={vi.fn()}
        className="custom-form-class"
      />
    );
    const form = container.querySelector('form');
    expect(form?.className).toContain('custom-form-class');
  });

  it('can keep form values local instead of syncing them from default values', () => {
    render(
      <FormGenerator
        id="test-form"
        schema={testSchema}
        fields={testFields}
        onSubmit={vi.fn()}
        defaultValues={{ name: 'Initial', email: 'initial@example.com' }}
        syncValues={false}
      />
    );

    expect(vi.mocked(useForm)).toHaveBeenCalledWith(expect.objectContaining({ values: undefined }));
  });

  it('applies field custom className', () => {
    const { container } = render(
      <FormGenerator
        id="test-form"
        schema={testSchema}
        fields={[
          {
            name: 'name' as const,
            type: 'text' as const,
            label: 'Field 1',
            className: 'custom-field-class',
          },
        ]}
        onSubmit={vi.fn()}
      />
    );
    const fieldDiv = container.querySelector('[class*="custom-field-class"]');
    expect(fieldDiv).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const handleSubmit = vi.fn();
    const { container } = render(
      <FormGenerator
        id="test-form"
        schema={testSchema}
        fields={testFields}
        onSubmit={handleSubmit}
      />
    );

    const form = container.querySelector('form')!;
    const submitEvent = new Event('submit', { bubbles: true });
    form.dispatchEvent(submitEvent);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
