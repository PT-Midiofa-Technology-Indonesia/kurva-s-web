'use client';

import { Clock, Maximize2, Minimize2, Minus, Plus, RotateCcw } from 'lucide-react';
import React, { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { cn } from '@/lib/utils';

// ─── Public Types ─────────────────────────────────────────────────────────────
export interface OrgChartNode {
  id: string;
  name: string;
  type: string;
  icon?: ReactNode;
  iconBgColor?: string;
  parentId?: string | null;
  status?: 'active' | 'inactive';
  statusLabel?: string;
  children?: OrgChartNode[];
  /** PIC count shown on the card — row is hidden when undefined (e.g. API has no PIC data yet) */
  picCount?: number;
  /** PIC names rendered inside the PIC row tooltip */
  picNames?: string[];
}

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'danger';
  onClick: (node: OrgChartNode) => void;
  disabled?: boolean | ((node: OrgChartNode) => boolean);
}

export interface OrgChartProps {
  nodes: OrgChartNode[];
  /** IDs of nodes that start collapsed */
  defaultCollapsed?: string[];
  /** Must include an explicit height, e.g. className="h-150" */
  className?: string;
  /** Called when a node card is clicked */
  onNodeClick?: (node: OrgChartNode) => void;
  /** Currently selected node id — used to render arrow overlays */
  selectedNodeId?: string | null;
  /** Render arrow action buttons around a selected node.
   *  Signature: (node, left, top, width, height) => nodes */
  renderArrowActions?: (
    node: OrgChartNode,
    left: number,
    top: number,
    w: number,
    h: number
  ) => ReactNode;
  /** Context menu items shown on right-click */
  contextMenuItems?: ContextMenuItem[];
  /** When 'block', right-click on the canvas is fully suppressed (e.g. view-only charts) */
  onCanvasContextMenu?: 'block';
  /** Show the fullscreen toggle above the zoom controls (bottom-right). Enabled by default. */
  showFullscreenButton?: boolean;
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const CARD_W = 300;
const CARD_H = 80;
const PIC_ROW_H = 24;
const H_GAP = 48;
const V_GAP = 80;
const STEM = 28;
const ARROW_LEN = 8;

function nodeHeight(node: OrgChartNode): number {
  return node.picCount !== undefined ? CARD_H + PIC_ROW_H : CARD_H;
}

// ─── Layout engine ────────────────────────────────────────────────────────────

interface PN {
  node: OrgChartNode;
  x: number;
  y: number;
  h: number;
  subtreeW: number;
  children: PN[];
}

function measure(node: OrgChartNode, collapsed: Set<string>, y: number): PN {
  const h = nodeHeight(node);
  const childY = y + h + V_GAP + STEM;
  const kids =
    !collapsed.has(node.id) && node.children?.length
      ? node.children.map((c) => measure(c, collapsed, childY))
      : [];

  const subtreeW =
    kids.length === 0
      ? CARD_W
      : kids.reduce((s, c) => s + c.subtreeW, 0) + H_GAP * (kids.length - 1);

  return { node, x: 0, y, h, subtreeW, children: kids };
}

function place(n: PN, left: number): void {
  n.x = left + (n.subtreeW - CARD_W) / 2;
  let cx = left;
  for (const c of n.children) {
    place(c, cx);
    cx += c.subtreeW + H_GAP;
  }
}

function flatten(n: PN): PN[] {
  return [n, ...n.children.flatMap(flatten)];
}

// ─── Connector SVG paths ──────────────────────────────────────────────────────

function ConnectorLines({ all }: { all: PN[] }) {
  const stems: string[] = [];
  const arrows: string[] = [];

  for (const p of all) {
    if (p.children.length === 0) continue;

    const pCX = p.x + CARD_W / 2;
    const pBY = p.y + p.h;
    const branchY = pBY + STEM;

    stems.push(`M${pCX},${pBY} L${pCX},${branchY}`);

    if (p.children.length > 1) {
      const lx = p.children[0].x + CARD_W / 2;
      const rx = p.children[p.children.length - 1].x + CARD_W / 2;
      stems.push(`M${lx},${branchY} L${rx},${branchY}`);
    }

    for (const child of p.children) {
      const ccx = child.x + CARD_W / 2;
      arrows.push(`M${ccx},${branchY} L${ccx},${child.y - ARROW_LEN}`);
    }
  }

  return (
    <>
      {stems.map((d, i) => (
        <path key={`s${i}`} d={d} stroke="#1E293B" strokeWidth={1.5} fill="none" />
      ))}
      {arrows.map((d, i) => (
        <path
          key={`a${i}`}
          d={d}
          stroke="#1E293B"
          strokeWidth={1.5}
          fill="none"
          markerEnd="url(#orgArrow)"
        />
      ))}
    </>
  );
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

function ContextMenu({
  items,
  x,
  y,
  node,
  onClose,
}: {
  items: ContextMenuItem[];
  x: number;
  y: number;
  node: OrgChartNode;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-max rounded-lg border border-slate-200 bg-white shadow-lg"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {items.map((item, idx) => {
        const isDisabled =
          typeof item.disabled === 'function' ? item.disabled(node) : Boolean(item.disabled);
        if (isDisabled) return null;
        return (
          <button
            key={idx}
            type="button"
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
              item.variant === 'danger'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-slate-700 hover:bg-slate-50'
            )}
            onClick={() => {
              item.onClick(node);
              onClose();
            }}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Node card ────────────────────────────────────────────────────────────────

function NodeCard({
  p,
  isCollapsed,
  dragRef,
  onToggle,
  onNodeClick,
  onContextMenu,
  hasArrowActions,
}: {
  p: PN;
  isCollapsed: boolean;
  dragRef: { current: number };
  onToggle: (id: string) => void;
  onNodeClick?: (node: OrgChartNode) => void;
  onContextMenu?: (node: OrgChartNode, x: number, y: number) => void;
  hasArrowActions?: boolean;
}) {
  const { node } = p;
  const hasChildren = Boolean(node.children?.length);
  const hasPicRow = node.picCount !== undefined;

  const handleClick = useCallback(() => {
    if (dragRef.current > 5) return;
    if (!hasArrowActions && hasChildren) onToggle(node.id);
    onNodeClick?.(node);
  }, [dragRef, hasChildren, node.id, node, onToggle, onNodeClick, hasArrowActions]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu?.(node, e.clientX, e.clientY);
    },
    [node, onContextMenu]
  );

  const style: React.CSSProperties = {
    position: 'absolute',
    left: p.x,
    top: p.y,
    width: CARD_W,
    height: p.h,
  };

  const cls = cn(
    'flex flex-col justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-shadow',
    hasChildren && 'cursor-pointer hover:shadow-md'
  );

  const inner = (
    <>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: node.iconBgColor ?? '#DCFCE7' }}
        >
          {node.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{node.name}</p>
          <p className="truncate text-xs text-slate-400">{node.type}</p>
        </div>

        {node.status && (
          <Badge
            variant="outline"
            className={cn(
              'shrink-0 border-0 text-xs',
              node.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            )}
          >
            {node.statusLabel ?? (node.status === 'active' ? 'Aktif' : 'Tidak Aktif')}
          </Badge>
        )}
      </div>

      {hasPicRow && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="mx-auto mt-1 flex w-fit cursor-default items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-500">{node.picCount} PIC</span>
              </span>
            </TooltipTrigger>
            {node.picNames && node.picNames.length > 0 && (
              <TooltipContent>{node.picNames.join(', ')}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Show/hide children toggle — hidden when arrow actions are active */}
      {!hasArrowActions && hasChildren && (
        <div className="absolute -bottom-3.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold leading-none text-slate-400 shadow-sm">
          {isCollapsed ? '+' : '−'}
        </div>
      )}
    </>
  );

  return (
    <button
      type="button"
      className={cn(cls, 'relative')}
      style={style}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {inner}
    </button>
  );
}

// ─── OrgChart ─────────────────────────────────────────────────────────────────

export function OrgChart({
  nodes,
  defaultCollapsed = [],
  className,
  onNodeClick,
  selectedNodeId,
  renderArrowActions,
  contextMenuItems,
  onCanvasContextMenu,
  showFullscreenButton = true,
}: OrgChartProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(defaultCollapsed));
  const [transform, setTransform] = useState({ x: 40, y: 40, scale: 1 });
  const [contextMenu, setContextMenu] = useState<{
    node: OrgChartNode;
    x: number;
    y: number;
  } | null>(null);
  const { ref: fullscreenRef, isFullscreen, toggleFullscreen } = useFullscreen<HTMLDivElement>();

  const isDragging = useRef(false);
  const totalDrag = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const hasCentered = useRef(false);
  const lastPinchDist = useRef(0);

  const toggleNode = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent) => {
      // Node cards stop propagation, so this only fires on empty canvas areas.
      if (onCanvasContextMenu === 'block') e.preventDefault();
    },
    [onCanvasContextMenu]
  );

  const handleNodeContextMenu = useCallback(
    (node: OrgChartNode, x: number, y: number) => {
      if (contextMenuItems && contextMenuItems.length > 0) {
        setContextMenu({ node, x, y });
      }
    },
    [contextMenuItems]
  );

  const allNodes = useMemo(() => {
    const roots = nodes.map((n) => measure(n, collapsed, 0));
    let left = 0;
    for (const r of roots) {
      place(r, left);
      left += r.subtreeW + H_GAP;
    }
    return roots.flatMap(flatten);
  }, [nodes, collapsed]);

  const canvasW = useMemo(
    () => (allNodes.length ? Math.max(...allNodes.map((n) => n.x + CARD_W)) + H_GAP : 400),
    [allNodes]
  );
  const canvasH = useMemo(
    () => (allNodes.length ? Math.max(...allNodes.map((n) => n.y + n.h)) + V_GAP : 300),
    [allNodes]
  );

  // ── Centering ─────────────────────────────────────────────────────────────

  const doCenter = useCallback(
    (cW: number, cH: number) => {
      if (cW === 0 || cH === 0) return;
      const scale = Math.min(1, (cW - 80) / canvasW, (cH - 80) / canvasH);
      setTransform({
        scale,
        x: (cW - canvasW * scale) / 2,
        y: Math.max(40, (cH - canvasH * scale) / 4),
      });
    },
    [canvasW, canvasH]
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    hasCentered.current = false;

    if (el.clientWidth > 0) {
      hasCentered.current = true;
      doCenter(el.clientWidth, el.clientHeight);
    }

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (!hasCentered.current && width > 0) {
        hasCentered.current = true;
        doCenter(width, height);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [doCenter]);

  // ── Pan ───────────────────────────────────────────────────────────────────

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-pan]')) return;
    isDragging.current = true;
    totalDrag.current = 0;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    totalDrag.current += Math.abs(dx) + Math.abs(dy);
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
  }, []);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  // ── Zoom (native listener with { passive: false }) ───────────────────────

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => {
      const newScale = Math.max(0.15, Math.min(2.5, prev.scale * factor));
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      return {
        scale: newScale,
        x: mx - (mx - prev.x) * (newScale / prev.scale),
        y: my - (my - prev.y) * (newScale / prev.scale),
      };
    });
  }, []);

  // ── Touch (native listeners with { passive: false }) ─────────────────────

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    totalDrag.current = 0;
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      totalDrag.current += Math.abs(dx) + Math.abs(dy);
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTransform((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / lastPinchDist.current;
      lastPinchDist.current = dist;
      setTransform((p) => ({
        ...p,
        scale: Math.max(0.15, Math.min(2.5, p.scale * factor)),
      }));
    }
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [onWheel, onTouchMove]);

  // ── Controls ──────────────────────────────────────────────────────────────

  const zoomIn = useCallback(
    () => setTransform((p) => ({ ...p, scale: Math.min(2.5, p.scale * 1.2) })),
    []
  );
  const zoomOut = useCallback(
    () => setTransform((p) => ({ ...p, scale: Math.max(0.15, p.scale / 1.2) })),
    []
  );
  const resetView = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    hasCentered.current = false;
    doCenter(el.clientWidth, el.clientHeight);
  }, [doCenter]);

  // Re-fit the view when entering fullscreen (layout dimensions change).
  useEffect(() => {
    if (!showFullscreenButton) return;
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) return;
      requestAnimationFrame(() => {
        const el = canvasRef.current;
        if (el) doCenter(el.clientWidth, el.clientHeight);
      });
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [showFullscreenButton, doCenter]);

  return (
    <div
      ref={fullscreenRef}
      className={cn('flex h-full w-full flex-col overflow-hidden bg-white', className)}
    >
      {/* Canvas */}
      <div
        ref={canvasRef}
        role="application"
        aria-label="Organization chart — drag to pan, scroll to zoom"
        className="relative flex-1 cursor-grab select-none overflow-hidden bg-[#F1F5F9] active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={onTouchStart}
        onTouchEnd={stopDrag}
        onContextMenu={handleCanvasContextMenu}
      >
        {/* Dot-grid background */}
        <svg
          aria-hidden
          role="presentation"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <pattern id="ogDots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#CBD5E1" opacity="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ogDots)" />
        </svg>

        {/* Transformed canvas */}
        <div
          style={{
            position: 'absolute',
            transformOrigin: '0 0',
            transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`,
            willChange: 'transform',
            width: canvasW,
            height: canvasH,
          }}
        >
          {/* SVG connectors */}
          <svg
            aria-hidden
            role="presentation"
            style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
            width={canvasW}
            height={canvasH}
          >
            <defs>
              <marker
                id="orgArrow"
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill="#1E293B" />
              </marker>
            </defs>
            <ConnectorLines all={allNodes} />
          </svg>

          {/* Cards */}
          {allNodes.map((p) => (
            <React.Fragment key={p.node.id}>
              <NodeCard
                p={p}
                isCollapsed={collapsed.has(p.node.id)}
                dragRef={totalDrag}
                onToggle={toggleNode}
                onNodeClick={onNodeClick}
                onContextMenu={handleNodeContextMenu}
                hasArrowActions={!!renderArrowActions}
              />
              {selectedNodeId === p.node.id &&
                renderArrowActions &&
                renderArrowActions(p.node, p.x, p.y, CARD_W, p.h)}
            </React.Fragment>
          ))}
        </div>

        {/* Zoom + fullscreen controls */}
        <div data-no-pan className="absolute bottom-4 right-4 flex flex-col gap-1.5">
          {showFullscreenButton && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg bg-white shadow-sm"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg bg-white shadow-sm"
            onClick={zoomIn}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg bg-white shadow-sm"
            onClick={zoomOut}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg bg-white shadow-sm"
            onClick={resetView}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        {/* Zoom label */}
        <div
          data-no-pan
          className="absolute bottom-4 left-4 rounded-md bg-white/80 px-2 py-1 text-xs text-slate-500 shadow-sm backdrop-blur-sm"
        >
          {Math.round(transform.scale * 100)}%
        </div>

        {/* Context menu */}
        {contextMenu && contextMenuItems && (
          <ContextMenu
            items={contextMenuItems}
            x={contextMenu.x}
            y={contextMenu.y}
            node={contextMenu.node}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </div>
  );
}
