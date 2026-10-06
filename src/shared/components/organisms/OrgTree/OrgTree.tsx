'use client';

import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface OrgTreeNode {
  id: string;
  name: string;
  type: string;
  icon: ReactNode;
  iconBgColor: string;
  positionCount?: number;
  positionLabel?: string;
  status?: 'active' | 'inactive';
  statusLabel?: string;
  children?: OrgTreeNode[];
}

export interface OrgTreeProps {
  title: string;
  subtitle?: string;
  nodes: OrgTreeNode[];
  renderActions?: (node: OrgTreeNode) => ReactNode;
  onNodeClick?: (node: OrgTreeNode) => void;
  defaultExpanded?: boolean;
  alwaysShowActions?: boolean;
  className?: string;
}

const INDENT_PX = 24;
const TOGGLE_WIDTH = 20;
const ICON_SIZE = 32;
const ROW_HEIGHT = 64;
const BASE_PADDING = 24;

function OrgTreeNodeRow({
  node,
  depth,
  renderActions,
  onNodeClick,
  defaultExpanded,
  alwaysShowActions,
}: {
  node: OrgTreeNode;
  depth: number;
  renderActions?: (node: OrgTreeNode) => ReactNode;
  onNodeClick?: (node: OrgTreeNode) => void;
  defaultExpanded?: boolean;
  alwaysShowActions?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? depth < 1);
  const hasChildren = Boolean(node.children?.length);

  // x-coordinate of the expand toggle center (used for connector lines)
  const toggleCenterX = BASE_PADDING + depth * INDENT_PX + TOGGLE_WIDTH / 2;
  // x-coordinate of where the next depth's toggle center will be
  const childToggleCenterX = BASE_PADDING + (depth + 1) * INDENT_PX + TOGGLE_WIDTH / 2;
  const horizontalConnectorWidth = childToggleCenterX - toggleCenterX;

  const rowContent = (
    <>
      {/* Expand / collapse toggle */}
      <button
        type="button"
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
        className={cn(
          'flex shrink-0 items-center justify-center rounded text-muted-foreground',
          'h-5 w-5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !hasChildren && 'pointer-events-none opacity-0'
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded((prev) => !prev);
        }}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Icon box */}
      <div
        className="flex shrink-0 items-center justify-center rounded"
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          backgroundColor: node.iconBgColor,
        }}
      >
        {node.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{node.name}</p>
        <p className="truncate text-xs text-muted-foreground">{node.type}</p>
      </div>

      {/* Badges */}
      <div className="flex shrink-0 items-center gap-2 pr-2">
        {node.positionCount !== undefined && (
          <Badge
            variant="outline"
            className="border-0 bg-slate-100 text-slate-600 hover:bg-slate-100"
          >
            {node.positionCount} {node.positionLabel ?? 'Position'}
          </Badge>
        )}
        {node.status && (
          <Badge variant={node.status === 'active' ? 'success' : 'destructive'}>
            {node.statusLabel ?? (node.status === 'active' ? 'Active' : 'Inactive')}
          </Badge>
        )}
      </div>

      {/* Actions */}
      {renderActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'mr-2 h-8 w-8 shrink-0',
                !alwaysShowActions &&
                  'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">{renderActions(node)}</DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );

  return (
    <div>
      {/* Node row */}
      {onNodeClick ? (
        <button
          type="button"
          className={cn(
            'group relative flex w-full items-center gap-3 border-b border-border text-left',
            'transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            depth === 0 ? 'bg-slate-50' : 'bg-white'
          )}
          style={{ height: ROW_HEIGHT, paddingLeft: BASE_PADDING + depth * INDENT_PX }}
          onClick={() => onNodeClick(node)}
        >
          {rowContent}
        </button>
      ) : (
        <div
          className={cn(
            'group relative flex items-center gap-3 border-b border-border',
            'transition-colors',
            depth === 0 ? 'bg-slate-50' : 'bg-white'
          )}
          style={{ height: ROW_HEIGHT, paddingLeft: BASE_PADDING + depth * INDENT_PX }}
        >
          {rowContent}
        </div>
      )}

      {/* Children with connector lines */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical connector line */}
          <div
            aria-hidden
            className="absolute top-0 w-px bg-border"
            style={{
              left: toggleCenterX,
              // Stop before the center of the last child row
              bottom: ROW_HEIGHT / 2,
            }}
          />

          {node.children!.map((child) => (
            <div key={child.id} className="relative">
              {/* Horizontal connector */}
              <div
                aria-hidden
                className="absolute top-1/2 h-px bg-border"
                style={{
                  left: toggleCenterX,
                  width: horizontalConnectorWidth,
                  // vertically center on the row
                  top: ROW_HEIGHT / 2,
                }}
              />
              <OrgTreeNodeRow
                node={child}
                depth={depth + 1}
                renderActions={renderActions}
                onNodeClick={onNodeClick}
                defaultExpanded={defaultExpanded}
                alwaysShowActions={alwaysShowActions}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrgTree({
  title,
  subtitle,
  nodes,
  renderActions,
  onNodeClick,
  defaultExpanded = true,
  alwaysShowActions,
  className,
}: OrgTreeProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-background', className)}>
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border bg-background px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      {/* Tree */}
      <div>
        {nodes.map((node) => (
          <OrgTreeNodeRow
            key={node.id}
            node={node}
            depth={0}
            renderActions={renderActions}
            onNodeClick={onNodeClick}
            defaultExpanded={defaultExpanded}
            alwaysShowActions={alwaysShowActions}
          />
        ))}
      </div>
    </div>
  );
}
