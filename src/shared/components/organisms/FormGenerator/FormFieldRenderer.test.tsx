import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { FormFieldRenderer } from './FormFieldRenderer';
import type {
  CheckboxFieldConfig,
  CurrencyFieldConfig,
  DateFieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  SeparatorConfig,
  SwitchFieldConfig,
  TextareaFieldConfig,
  TextFieldConfig,
} from './types';

vi.mock('@/components/atoms', () => ({
  Input: ({ label, ...props }: any) => (
    <div data-testid="input-field">
      {label && <label>{label}</label>}
      <input {...props} />
    </div>
  ),
  InputNumber: ({ label, onChange, ...props }: any) => (
    <div data-testid="input-number-field">
      {label && <label>{label}</label>}
      <input {...props} type="number" />
      <button type="button" data-testid="clear-number" onClick={() => onChange?.(undefined)}>
        Clear
      </button>
    </div>
  ),
  InputCurrency: ({ label, ...props }: any) => (
    <div data-testid="input-currency-field">
      {label && <label>{label}</label>}
      <input {...props} type="text" />
    </div>
  ),
  AsyncSelect: ({ options }: any) => (
    <div data-testid="async-select-field">
      {options?.map((opt: any) => (
        <div key={opt.value} data-testid={`option-${opt.value}`}>
          {opt.label}
        </div>
      ))}
    </div>
  ),
  Checkbox: ({ label, ...props }: any) => (
    <div data-testid="checkbox-field">
      <input type="checkbox" {...props} />
      {label && <label>{label}</label>}
    </div>
  ),
  Switch: ({ label, checked, ...props }: any) => (
    <div data-testid="switch-field">
      <input type="checkbox" {...props} role="switch" aria-checked={checked} checked={checked} />
      {label && <label>{label}</label>}
    </div>
  ),
}));

vi.mock('@/components/molecules', () => ({
  DatePicker: ({ placeholder }: any) => (
    <input type="date" placeholder={placeholder} data-testid="date-picker" />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => (
    <label className={className} data-testid="form-label">
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ placeholder, ...props }: any) => (
    <textarea placeholder={placeholder} data-testid="textarea-field" {...props} />
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: ({ className, ...props }: any) => (
    <hr className={className} data-testid="separator" {...props} />
  ),
}));

vi.mock('lucide-react', () => ({
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
  Upload: () => <span data-testid="upload-icon">Upload</span>,
  X: () => <span data-testid="x-icon">X</span>,
}));

vi.mock('@/shared/components/molecules/FileInput', () => ({
  FileInput: ({ value, onChange }: any) => (
    <div data-testid="file-input-field">
      <input
        type="file"
        onChange={(e) => onChange?.(e.target.files ? Array.from(e.target.files) : [])}
      />
      {value?.length > 0 && <span data-testid="file-count">{value.length} files</span>}
    </div>
  ),
}));

describe('FormFieldRenderer', () => {
  function renderWithForm(field: any) {
    const TestComponent = () => {
      const form = useForm({
        defaultValues: {
          [field.name]: field.defaultValue ?? '',
        },
      });

      return (
        <FormProvider {...form}>
          <FormFieldRenderer field={field} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  }

  describe('Text Field', () => {
    it('renders text input field', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'username',
        label: 'Username',
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });

    it('renders text input with label', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'email',
        label: 'Email Address',
      };

      renderWithForm(field);
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('renders email input type', () => {
      const field: TextFieldConfig<any> = {
        type: 'email',
        name: 'email',
        label: 'Email',
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });

    it('renders password input with visibility toggle', () => {
      const field: TextFieldConfig<any> = {
        type: 'password',
        name: 'password',
        label: 'Password',
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });

    it('renders text input with placeholder', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'name',
        label: 'Full Name',
        placeholder: 'Enter your name',
      };

      renderWithForm(field);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('renders disabled text input', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'disabled_field',
        label: 'Disabled',
        disabled: true,
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });

    it('renders required text input', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'required_field',
        label: 'Required Field',
        required: true,
      };

      renderWithForm(field);
      expect(screen.getByText('Required Field')).toBeInTheDocument();
    });
  });

  describe('Number Field', () => {
    it('renders number input field', () => {
      const field: NumberFieldConfig<any> = {
        type: 'number',
        name: 'quantity',
        label: 'Quantity',
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-number-field')).toBeInTheDocument();
    });

    it('renders number input with decimal places', () => {
      const field: NumberFieldConfig<any> = {
        type: 'number',
        name: 'price',
        label: 'Price',
        decimalPlaces: 2,
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-number-field')).toBeInTheDocument();
    });

    it('renders number input allowing negative', () => {
      const field: NumberFieldConfig<any> = {
        type: 'number',
        name: 'balance',
        label: 'Balance',
        allowNegative: true,
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-number-field')).toBeInTheDocument();
    });

    it('uses the configured empty value when a number field is cleared', async () => {
      const user = userEvent.setup();
      const field = {
        type: 'number',
        name: 'quantity',
        label: 'Quantity',
        defaultValue: 12,
        emptyValue: 0,
      } as NumberFieldConfig<any> & { defaultValue: number };

      renderWithForm(field);

      await user.click(screen.getByTestId('clear-number'));

      expect(screen.getByRole('spinbutton')).toHaveValue(0);
    });
  });

  describe('Currency Field', () => {
    it('renders currency input field', () => {
      const field: CurrencyFieldConfig<any> = {
        type: 'currency',
        name: 'amount',
        label: 'Amount',
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-currency-field')).toBeInTheDocument();
    });

    it('renders currency input with locale', () => {
      const field: CurrencyFieldConfig<any> = {
        type: 'currency',
        name: 'amount',
        label: 'Amount',
        locale: 'id-ID',
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-currency-field')).toBeInTheDocument();
    });

    it('renders currency input with currency code', () => {
      const field: CurrencyFieldConfig<any> = {
        type: 'currency',
        name: 'amount',
        label: 'Amount',
        currency: 'USD',
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-currency-field')).toBeInTheDocument();
    });
  });

  describe('Select Field', () => {
    it('renders select field', () => {
      const field: SelectFieldConfig<any> = {
        type: 'select',
        name: 'category',
        label: 'Category',
        options: [
          { value: 'cat1', label: 'Category 1' },
          { value: 'cat2', label: 'Category 2' },
        ],
      };

      renderWithForm(field);
      expect(screen.getByTestId('async-select-field')).toBeInTheDocument();
    });

    it('renders select with options', () => {
      const field: SelectFieldConfig<any> = {
        type: 'select',
        name: 'status',
        label: 'Status',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      };

      renderWithForm(field);
      expect(screen.getByTestId('option-active')).toBeInTheDocument();
      expect(screen.getByTestId('option-inactive')).toBeInTheDocument();
    });

    it('renders multi-select field', () => {
      const field: SelectFieldConfig<any> = {
        type: 'select',
        name: 'tags',
        label: 'Tags',
        isMulti: true,
        options: [
          { value: 'tag1', label: 'Tag 1' },
          { value: 'tag2', label: 'Tag 2' },
        ],
      };

      renderWithForm(field);
      expect(screen.getByTestId('async-select-field')).toBeInTheDocument();
    });
  });

  describe('Date Field', () => {
    it('renders date field', () => {
      const field: DateFieldConfig<any> = {
        type: 'date',
        name: 'birthday',
        label: 'Birthday',
      };

      renderWithForm(field);
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    });

    it('renders date field with min/max dates', () => {
      const field: DateFieldConfig<any> = {
        type: 'date',
        name: 'appointment',
        label: 'Appointment',
        minDate: new Date('2024-01-01'),
        maxDate: new Date('2024-12-31'),
      };

      renderWithForm(field);
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    });
  });

  describe('Checkbox Field', () => {
    it('renders checkbox field', () => {
      const field: CheckboxFieldConfig<any> = {
        type: 'checkbox',
        name: 'agree',
        label: 'I agree',
      };

      renderWithForm(field);
      expect(screen.getByTestId('checkbox-field')).toBeInTheDocument();
    });

    it('renders checkbox with label', () => {
      const field: CheckboxFieldConfig<any> = {
        type: 'checkbox',
        name: 'subscribe',
        label: 'Subscribe to newsletter',
        description: 'Get updates',
      };

      renderWithForm(field);
      expect(screen.getByText('Subscribe to newsletter')).toBeInTheDocument();
    });
  });

  describe('Switch Field', () => {
    it('renders switch field', () => {
      const field: SwitchFieldConfig<any> = {
        type: 'switch',
        name: 'enabled',
        label: 'Enabled',
      };

      renderWithForm(field);
      expect(screen.getByTestId('switch-field')).toBeInTheDocument();
    });

    it('renders switch with label', () => {
      const field: SwitchFieldConfig<any> = {
        type: 'switch',
        name: 'notifications',
        label: 'Enable Notifications',
        labelPosition: 'right',
      };

      renderWithForm(field);
      expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
    });
  });

  describe('Textarea Field', () => {
    it('renders textarea field', () => {
      const field: TextareaFieldConfig<any> = {
        type: 'textarea',
        name: 'description',
        label: 'Description',
      };

      renderWithForm(field);
      expect(screen.getByTestId('textarea-field')).toBeInTheDocument();
    });

    it('renders textarea with rows', () => {
      const field: TextareaFieldConfig<any> = {
        type: 'textarea',
        name: 'bio',
        label: 'Bio',
        rows: 5,
      };

      renderWithForm(field);
      expect(screen.getByTestId('textarea-field')).toBeInTheDocument();
    });

    it('renders textarea with placeholder', () => {
      const field: TextareaFieldConfig<any> = {
        type: 'textarea',
        name: 'notes',
        label: 'Notes',
        placeholder: 'Enter notes here',
      };

      renderWithForm(field);
      expect(screen.getByPlaceholderText('Enter notes here')).toBeInTheDocument();
    });
  });

  describe('Separator Field', () => {
    it('renders separator without label', () => {
      const field: SeparatorConfig = {
        type: 'separator',
      };

      renderWithForm(field);
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('renders separator with label', () => {
      const field: SeparatorConfig = {
        type: 'separator',
        label: 'Additional Information',
      };

      renderWithForm(field);
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    it('renders separator with custom class', () => {
      const field: SeparatorConfig = {
        type: 'separator',
        className: 'custom-class',
      };

      renderWithForm(field);
      const separators = screen.getAllByTestId('separator');
      expect(separators[0]).toHaveClass('custom-class');
    });
  });

  describe('Hidden Field', () => {
    it('renders visible field when hideRules not met', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'visible_field',
        label: 'Visible Field',
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });
  });

  describe('Disabled Field', () => {
    it('renders disabled field when enableRules not met', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'conditional',
        label: 'Conditional Field',
        enableRules: [
          {
            conditions: [{ field: 'enable', value: true }],
            mode: 'all',
          },
        ],
      };

      const TestComponent = () => {
        const form = useForm({
          defaultValues: {
            conditional: '',
            enable: false,
          },
        });

        return (
          <FormProvider {...form}>
            <FormFieldRenderer field={field} />
          </FormProvider>
        );
      };

      render(<TestComponent />);
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });
  });

  describe('Custom Field', () => {
    it('renders custom field content', () => {
      const field = {
        type: 'custom',
        content: <div data-testid="custom-content">Custom Field</div>,
      };

      renderWithForm(field);
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('renders required text field', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'required_text',
        label: 'Required Text',
        required: true,
      };

      renderWithForm(field);
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
      expect(screen.getByText('Required Text')).toBeInTheDocument();
    });

    it('renders required field by rules', () => {
      const field: TextFieldConfig<any> = {
        type: 'text',
        name: 'required_by_rules',
        label: 'Required by Rules',
        requiredRules: [
          {
            conditions: [{ field: 'type', value: 'special' }],
            mode: 'all',
          },
        ],
      };

      const TestComponent = () => {
        const form = useForm({
          defaultValues: {
            required_by_rules: '',
            type: 'special',
          },
        });

        return (
          <FormProvider {...form}>
            <FormFieldRenderer field={field} />
          </FormProvider>
        );
      };

      render(<TestComponent />);
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });
  });
});
