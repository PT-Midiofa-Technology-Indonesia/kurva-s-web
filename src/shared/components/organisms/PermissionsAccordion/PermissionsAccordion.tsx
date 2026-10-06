'use client';

import { ChevronDownIcon } from 'lucide-react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { Switch } from '@/components/atoms/Switch';
import { PermissionGroup } from '@/components/molecules/PermissionGroup';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { Permission } from '@/types/permissions';
import { cn } from '@/utils/cn';

interface PermissionsAccordionProps {
  permission: Permission;
  onPermissionChange: (permission: Permission) => void;
  selectAllLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function PermissionsAccordion({
  permission,
  onPermissionChange,
  selectAllLabel = 'Pilih semua',
  className,
  disabled = false,
}: PermissionsAccordionProps) {
  const allSubPermissionsChecked = permission.groups.every((group) =>
    group.subPermissions.every((subPerm) => subPerm.checked)
  );

  const handleSelectAllChange = (checked: boolean) => {
    const updatedPermission: Permission = {
      ...permission,
      selectAll: checked,
      groups: permission.groups.map((group) => ({
        ...group,
        subPermissions: group.subPermissions.map((subPerm) => ({
          ...subPerm,
          checked,
        })),
      })),
    };
    onPermissionChange(updatedPermission);
  };

  const handleSubPermissionChange = (
    groupId: string,
    subPermissionId: string,
    checked: boolean
  ) => {
    const updatedPermission: Permission = {
      ...permission,
      groups: permission.groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            subPermissions: group.subPermissions.map((subPerm) =>
              subPerm.id === subPermissionId ? { ...subPerm, checked } : subPerm
            ),
          };
        }
        return group;
      }),
    };

    const allChecked = updatedPermission.groups.every((group) =>
      group.subPermissions.every((subPerm) => subPerm.checked)
    );

    updatedPermission.selectAll = allChecked;
    onPermissionChange(updatedPermission);
  };

  return (
    <div className={cn('border border-slate-200 rounded-lg', className)}>
      <Accordion type="single" collapsible>
        <AccordionItem value={permission.id} className="border-0">
          <AccordionPrimitive.Header
            className={cn('flex items-center gap-3 px-5 py-4', disabled && 'cursor-default')}
          >
            <AccordionPrimitive.Trigger asChild>
              {/* biome-ignore lint/a11y/useSemanticElements: Switch (button) inside Accordion trigger causes nested buttons. Div is required here. */}
              <div
                role="button"
                tabIndex={0}
                className="group flex flex-1 items-center gap-3 text-left outline-none transition-all cursor-pointer"
              >
                <div className="flex flex-col gap-1 text-left flex-1">
                  <h3 className="text-sm font-medium text-slate-950">{permission.name}</h3>
                  <p className="text-sm font-normal text-slate-500">{permission.description}</p>
                </div>
                {!disabled && (
                  <label
                    className="flex items-center gap-2 shrink-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
                    }}
                  >
                    <Switch
                      checked={allSubPermissionsChecked}
                      onCheckedChange={handleSelectAllChange}
                      disabled={disabled}
                      label={selectAllLabel}
                      labelPosition="right"
                    />
                  </label>
                )}
                <ChevronDownIcon className="h-5 w-5 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>

          <AccordionContent className="px-5 pt-0 pb-4">
            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2">
              {permission.groups.map((group) => (
                <PermissionGroup
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  icon={group.icon}
                  subPermissions={group.subPermissions}
                  onSubPermissionChange={(subPermId, checked) =>
                    handleSubPermissionChange(group.id, subPermId, checked)
                  }
                  disabled={disabled}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
