import type { Meta, StoryObj } from '@storybook/nextjs';
import { Mail, Search } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/atoms';
import { FormGenerator } from './FormGenerator';
import type { FormFieldConfig, FormGeneratorProps } from './types';

// ─── Registration Form — responsive colSpan ────────────────────────────────────
// base: stacked (12 cols each) → sm+: side-by-side (6 cols each)

const registrationSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

const registrationFields: FormFieldConfig<RegistrationFormData>[] = [
  {
    type: 'text',
    name: 'firstName',
    label: 'First Name',
    placeholder: 'John',
    required: true,
    colSpan: { base: 12, sm: 6 }, // stacked on mobile, side-by-side from sm
  },
  {
    type: 'text',
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Doe',
    required: true,
    colSpan: { base: 12, sm: 6 },
  },
  {
    type: 'email',
    name: 'email',
    label: 'Email Address',
    placeholder: 'john@example.com',
    required: true,
    leftIcon: <Mail size={16} />,
    colSpan: 12,
  },
  {
    type: 'password',
    name: 'password',
    label: 'Password',
    placeholder: '••••••••',
    required: true,
    hint: 'At least 8 characters',
    colSpan: { base: 12, sm: 6 },
  },
  {
    type: 'password',
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: '••••••••',
    required: true,
    colSpan: { base: 12, sm: 6 },
  },
];

type RegistrationFormProps = Omit<FormGeneratorProps<RegistrationFormData>, 'schema' | 'fields'>;

function RegistrationFormGenerator(props: RegistrationFormProps) {
  return (
    <FormGenerator<RegistrationFormData>
      schema={registrationSchema}
      fields={registrationFields}
      {...props}
    />
  );
}

const meta = {
  title: 'Organisms/FormGenerator',
  component: RegistrationFormGenerator,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof RegistrationFormGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RegistrationForm: Story = {
  args: {
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
    actions: (
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Register</Button>
      </div>
    ),
  },
};

// ─── Employee Profile — responsive 3-col + rowSpan ────────────────────────────
// Personal Info: base 12 → md 6 → lg 4 (3-col grid)
// Compensation: notes spans 2 rows at md+, salary + switch stack beside it

const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  department: z.string().min(1, 'Department is required'),
  role: z.string().min(1, 'Role is required'),
  startDate: z.date({ error: 'Start date is required' }),
  notes: z.string().optional(),
  salary: z.number().min(0, 'Salary is required'),
  isActive: z.boolean().default(true),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const profileFields: FormFieldConfig<ProfileFormData>[] = [
  { type: 'separator', label: 'Personal Info', colSpan: 12 },
  {
    type: 'text',
    name: 'fullName',
    label: 'Full Name',
    placeholder: 'John Doe',
    required: true,
    colSpan: { base: 12, md: 6, lg: 4 }, // 1-col → 2-col → 3-col
  },
  {
    type: 'select',
    name: 'department',
    label: 'Department',
    required: true,
    colSpan: { base: 12, md: 6, lg: 4 },
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'design', label: 'Design' },
      { value: 'product', label: 'Product' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'hr', label: 'Human Resources' },
    ],
  },
  {
    type: 'select',
    name: 'role',
    label: 'Role',
    required: true,
    colSpan: { base: 12, md: 6, lg: 4 },
    options: [
      { value: 'staff', label: 'Staff' },
      { value: 'senior', label: 'Senior' },
      { value: 'lead', label: 'Lead' },
      { value: 'manager', label: 'Manager' },
    ],
  },
  {
    type: 'date',
    name: 'startDate',
    label: 'Start Date',
    required: true,
    colSpan: { base: 12, md: 6, lg: 4 },
  },
  { type: 'separator', label: 'Compensation & Notes', colSpan: 12 },
  // Notes comes FIRST so it can row-span beside the two fields that follow
  // md layout: [notes (col-6, row-span-2)] | [salary (col-6)]
  //                                         | [switch (col-6)]
  {
    type: 'textarea',
    name: 'notes',
    label: 'Notes',
    placeholder: 'Additional notes about this employee...',
    rows: 4,
    colSpan: { base: 12, md: 6 },
    rowSpan: { md: 2 }, // spans 2 rows from md — salary + switch fill the right column
  },
  {
    type: 'currency',
    name: 'salary',
    label: 'Monthly Salary',
    required: true,
    placeholder: '0',
    colSpan: { base: 12, md: 6 },
  },
  {
    type: 'switch',
    name: 'isActive',
    label: 'Active Employee',
    colSpan: { base: 12, md: 6 },
  },
];

type ProfileFormProps = Omit<FormGeneratorProps<ProfileFormData>, 'schema' | 'fields'>;

function ProfileFormGenerator(props: ProfileFormProps) {
  return (
    <FormGenerator<ProfileFormData>
      schema={profileSchema}
      fields={profileFields}
      defaultValues={{ isActive: true }}
      {...props}
    />
  );
}

export const EmployeeProfileForm: Story = {
  args: { onSubmit: () => {} },
  render: () => (
    <ProfileFormGenerator
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      actions={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Save Employee</Button>
        </div>
      }
    />
  ),
};

// ─── Article Editor — rowSpan sidebar layout ──────────────────────────────────
// Content textarea takes 2/3 width and spans 3 rows at lg.
// Title, Slug, Category fill the right column beside it.
// lg layout:
//   ┌─────────────────────────┬───────────────┐
//   │                         │ Title         │
//   │  Content                ├───────────────┤
//   │  (lg: col-8, row-3)     │ Slug          │
//   │                         ├───────────────┤
//   │                         │ Category      │
//   ├─────────────────────────┴───────────────┤
//   │  ── Publishing ──                       │
//   ├─────────────────────────┬───────────────┤
//   │  Publish Date           │  Published    │
//   └─────────────────────────┴───────────────┘

const articleSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  publishedAt: z.date().optional(),
  isPublished: z.boolean().default(false),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const articleFields: FormFieldConfig<ArticleFormData>[] = [
  // Content FIRST in DOM — must precede the sidebar fields so auto-placement works
  {
    type: 'textarea',
    name: 'content',
    label: 'Content',
    placeholder: 'Write your article here...',
    required: true,
    colSpan: { base: 12, lg: 8 },
    rowSpan: { lg: 3 }, // spans 3 implicit grid rows at lg
  },
  // Sidebar — auto-placed into col 9–12 across rows 1, 2, 3
  {
    type: 'text',
    name: 'title',
    label: 'Title',
    placeholder: 'My article title',
    required: true,
    colSpan: { base: 12, lg: 4 },
  },
  {
    type: 'text',
    name: 'slug',
    label: 'Slug',
    placeholder: 'my-article-title',
    colSpan: { base: 12, lg: 4 },
  },
  {
    type: 'select',
    name: 'category',
    label: 'Category',
    required: true,
    colSpan: { base: 12, lg: 4 },
    options: [
      { value: 'tech', label: 'Technology' },
      { value: 'business', label: 'Business' },
      { value: 'design', label: 'Design' },
      { value: 'culture', label: 'Culture' },
    ],
  },
  // Below the row-span area
  { type: 'separator', label: 'Publishing', colSpan: 12 },
  {
    type: 'date',
    name: 'publishedAt',
    label: 'Publish Date',
    colSpan: { base: 12, md: 6 },
  },
  {
    type: 'switch',
    name: 'isPublished',
    label: 'Published',
    colSpan: { base: 12, md: 6 },
  },
];

type ArticleFormProps = Omit<FormGeneratorProps<ArticleFormData>, 'schema' | 'fields'>;

function ArticleFormGenerator(props: ArticleFormProps) {
  return (
    <FormGenerator<ArticleFormData>
      schema={articleSchema}
      fields={articleFields}
      defaultValues={{ isPublished: false }}
      {...props}
    />
  );
}

export const ArticleEditorForm: Story = {
  args: { onSubmit: () => {} },
  render: () => (
    <ArticleFormGenerator
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      actions={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Discard
          </Button>
          <Button type="submit">Publish</Button>
        </div>
      }
    />
  ),
};

// ─── Product Filter — responsive 1→2→3 col breakpoints ────────────────────────
// base: 12 (1 col) → md: 6 (2 col) → lg: 4 (3 col)
// Price range uses base: 6 (always side-by-side, smallest pair)

const filterSchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.any().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  inStockOnly: z.boolean().default(false),
});

type FilterFormData = z.infer<typeof filterSchema>;

const filterFields: FormFieldConfig<FilterFormData>[] = [
  {
    type: 'text',
    name: 'keyword',
    label: 'Search Keyword',
    placeholder: 'Search products...',
    leftIcon: <Search size={16} />,
    colSpan: 12,
  },
  {
    type: 'select',
    name: 'category',
    label: 'Category',
    colSpan: { base: 12, md: 6, lg: 4 },
    isClearable: true,
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'food', label: 'Food & Beverage' },
      { value: 'furniture', label: 'Furniture' },
    ],
  },
  {
    type: 'select',
    name: 'tags',
    label: 'Tags',
    colSpan: { base: 12, md: 6, lg: 4 },
    isMulti: true,
    isClearable: true,
    options: [
      { value: 'new', label: 'New Arrival' },
      { value: 'sale', label: 'On Sale' },
      { value: 'popular', label: 'Popular' },
      { value: 'limited', label: 'Limited Edition' },
    ],
  },
  {
    type: 'date-range',
    name: 'dateRange',
    label: 'Date Range',
    colSpan: { base: 12, md: 6, lg: 4 },
  },
  // Price pair — always side-by-side (base: 6), narrowing at lg
  {
    type: 'number',
    name: 'priceMin',
    label: 'Min Price',
    placeholder: '0',
    colSpan: { base: 6, lg: 3 },
  },
  {
    type: 'number',
    name: 'priceMax',
    label: 'Max Price',
    placeholder: '999999',
    colSpan: { base: 6, lg: 3 },
  },
  {
    type: 'checkbox',
    name: 'inStockOnly',
    label: 'In Stock Only',
    description: 'Show only items currently available',
    colSpan: { base: 12, lg: 6 },
  },
];

type FilterFormProps = Omit<FormGeneratorProps<FilterFormData>, 'schema' | 'fields'>;

function FilterFormGenerator(props: FilterFormProps) {
  return (
    <FormGenerator<FilterFormData>
      schema={filterSchema}
      fields={filterFields}
      defaultValues={{ inStockOnly: false }}
      {...props}
    />
  );
}

export const ProductFilterForm: Story = {
  args: { onSubmit: () => {} },
  render: () => (
    <FilterFormGenerator
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      actions={
        <div className="flex justify-end gap-3">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <Button type="submit">Apply Filters</Button>
        </div>
      }
    />
  ),
};

// ─── Contact Form — custom content + responsive ───────────────────────────────

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: 'You must agree to the terms',
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactFields: FormFieldConfig<ContactFormData>[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Your Name',
    placeholder: 'Jane Smith',
    required: true,
    colSpan: { base: 12, sm: 6 },
  },
  {
    type: 'email',
    name: 'email',
    label: 'Email Address',
    placeholder: 'jane@example.com',
    required: true,
    leftIcon: <Mail size={16} />,
    colSpan: { base: 12, sm: 6 },
  },
  {
    type: 'custom',
    colSpan: 12,
    content: (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
        Your message will be reviewed within 24 hours.
      </div>
    ),
  },
  {
    type: 'textarea',
    name: 'message',
    label: 'Message',
    placeholder: 'How can we help you?',
    required: true,
    rows: 4,
    colSpan: 12,
  },
  {
    type: 'checkbox',
    name: 'agreeToTerms',
    label: 'I agree to the Terms & Conditions',
    description: 'Read our privacy policy for details',
    colSpan: 12,
  },
];

type ContactFormProps = Omit<FormGeneratorProps<ContactFormData>, 'schema' | 'fields'>;

function ContactFormGenerator(props: ContactFormProps) {
  return (
    <FormGenerator<ContactFormData> schema={contactSchema} fields={contactFields} {...props} />
  );
}

export const ContactFormWithCustomContent: Story = {
  args: { onSubmit: () => {} },
  render: () => (
    <ContactFormGenerator
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      actions={
        <Button type="submit" className="w-full">
          Send Message
        </Button>
      }
    />
  ),
};

// ─── Vendor Form — checkbox-group with refine validation ─────────────────────

const vendorSchema = z
  .object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    isSubcontractor: z.boolean(),
    isSupplier: z.boolean(),
    isLogistic: z.boolean(),
  })
  .refine((data) => data.isSubcontractor || data.isSupplier || data.isLogistic, {
    message: 'Select at least one vendor type',
    path: ['isSubcontractor'],
  });

type VendorFormData = z.infer<typeof vendorSchema>;

const vendorFields: FormFieldConfig<VendorFormData>[] = [
  {
    type: 'text',
    name: 'code',
    label: 'Vendor Code',
    placeholder: 'VD001',
    required: true,
    colSpan: 4,
  },
  {
    type: 'text',
    name: 'name',
    label: 'Vendor Name',
    placeholder: 'Acme Corp',
    required: true,
    colSpan: 4,
  },
  {
    type: 'checkbox-group',
    name: 'isSubcontractor',
    label: 'Vendor Type',
    required: true,
    colSpan: 12,
    items: [
      { label: 'Subcontractor', name: 'isSubcontractor' },
      { label: 'Supplier', name: 'isSupplier' },
      { label: 'Logistic', name: 'isLogistic' },
    ],
  },
];

type VendorFormProps = Omit<FormGeneratorProps<VendorFormData>, 'schema' | 'fields'>;

function VendorFormGenerator(props: VendorFormProps) {
  return (
    <FormGenerator<VendorFormData>
      schema={vendorSchema}
      fields={vendorFields}
      defaultValues={{
        isSubcontractor: false,
        isSupplier: false,
        isLogistic: false,
      }}
      {...props}
    />
  );
}

export const VendorFormWithCheckboxGroup: Story = {
  args: { onSubmit: () => {} },
  render: () => (
    <VendorFormGenerator
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      actions={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Save Vendor</Button>
        </div>
      }
    />
  ),
};

// ─── Role & Permissions Form — conditional field enabling with enableRules ─────
// Demonstrates how to enable/disable fields based on other field values.
// - "Permissions" select is disabled until a role is selected
// - "Expiry Date" is enabled only for limited roles
// - "Manager Approval" is enabled only for manager or director roles

const rolePermissionSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.string().min(1, 'Role is required'),
  permissions: z.array(z.string()).optional(),
  accessLevel: z.string().optional(),
  expiryDate: z.date().optional(),
  requiresManagerApproval: z.boolean().default(false),
  departmentBudget: z.number().optional(),
  teamSize: z.number().optional(),
  notes: z.string().optional(),
});

type RolePermissionFormData = z.infer<typeof rolePermissionSchema>;

const rolePermissionFields: FormFieldConfig<RolePermissionFormData>[] = [
  {
    type: 'text',
    name: 'username',
    label: 'Username',
    placeholder: 'john.doe',
    required: true,
    colSpan: { base: 12, sm: 6 },
  },
  {
    type: 'select',
    name: 'role',
    label: 'Role',
    required: true,
    colSpan: { base: 12, sm: 6 },
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'director', label: 'Director' },
      { value: 'staff', label: 'Staff' },
      { value: 'guest', label: 'Guest' },
    ],
  },
  // Permissions: enabled when role is selected (single condition)
  {
    type: 'select',
    name: 'permissions',
    label: 'Permissions',
    colSpan: { base: 12, sm: 6 },
    isMulti: true,
    isClearable: true,
    options: [
      { value: 'read', label: 'Read' },
      { value: 'write', label: 'Write' },
      { value: 'delete', label: 'Delete' },
      { value: 'admin', label: 'Admin' },
    ],
    enableRules: [
      {
        conditions: [{ field: 'role', evaluator: (v) => !!v }],
      },
    ],
  },
  // Access level: enabled only for manager and director
  {
    type: 'select',
    name: 'accessLevel',
    label: 'Access Level',
    colSpan: { base: 12, sm: 6 },
    options: [
      { value: 'full', label: 'Full Access' },
      { value: 'limited', label: 'Limited Access' },
      { value: 'readonly', label: 'Read Only' },
    ],
    enableRules: [
      {
        conditions: [{ field: 'role', values: ['manager', 'director'] }],
      },
    ],
  },
  // Expiry date: enabled only when access level is 'limited'
  {
    type: 'date',
    name: 'expiryDate',
    label: 'Access Expiry Date',
    colSpan: { base: 12, sm: 6 },
    enableRules: [
      {
        conditions: [{ field: 'accessLevel', value: 'limited' }],
      },
    ],
  },
  // Manager approval: enabled only for manager or director roles
  {
    type: 'switch',
    name: 'requiresManagerApproval',
    label: 'Requires Manager Approval',
    colSpan: { base: 12, sm: 6 },
    enableRules: [
      {
        conditions: [{ field: 'role', values: ['manager', 'director'] }],
      },
    ],
  },
  { type: 'separator', label: 'Department Management', colSpan: 12 },
  // Department budget: enabled only when BOTH role is manager/director AND accessLevel is full (AND mode)
  {
    type: 'currency',
    name: 'departmentBudget',
    label: 'Department Budget',
    placeholder: '0',
    colSpan: { base: 12, sm: 6 },
    enableRules: [
      {
        mode: 'all', // ALL conditions must be true
        conditions: [
          { field: 'role', values: ['manager', 'director'] },
          { field: 'accessLevel', value: 'full' },
        ],
      },
    ],
  },
  // Team size: enabled when role is manager/director OR accessLevel is full (ANY mode)
  {
    type: 'number',
    name: 'teamSize',
    label: 'Team Size',
    placeholder: '0',
    colSpan: { base: 12, sm: 6 },
    enableRules: [
      {
        mode: 'any', // AT LEAST ONE condition must be true
        conditions: [
          { field: 'role', values: ['manager', 'director'] },
          { field: 'accessLevel', value: 'full' },
        ],
      },
    ],
  },
  // Notes always enabled
  {
    type: 'textarea',
    name: 'notes',
    label: 'Additional Notes',
    placeholder: 'Any special instructions or notes...',
    rows: 3,
    colSpan: 12,
  },
];

type RolePermissionFormProps = Omit<
  FormGeneratorProps<RolePermissionFormData>,
  'schema' | 'fields'
>;

function RolePermissionFormGenerator(props: RolePermissionFormProps) {
  return (
    <FormGenerator<RolePermissionFormData>
      schema={rolePermissionSchema}
      fields={rolePermissionFields}
      {...props}
    />
  );
}

export const RolePermissionForm: Story = {
  args: { onSubmit: () => {} },
  render: () => (
    <RolePermissionFormGenerator
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      actions={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Assign Permissions</Button>
        </div>
      }
    />
  ),
};
