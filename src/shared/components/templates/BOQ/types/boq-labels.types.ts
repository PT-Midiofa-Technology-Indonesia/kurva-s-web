export interface BOQContextMenuLabels {
  cut: string;
  copy: string;
  paste: string;
  insertAbove: string;
  insertBelow: string;
  delete: string;
  makeLast?: string;
  addChild?: string;
}

export interface BOQColumnLabels {
  kode: string;
  jobItem: string;
  jenis: string;
  rab: string;
  uom: string;
  remarks: string;
  volume?: string;
  amount?: string;
  material?: string;
  work?: string;
  bobot?: string;
  tambah?: string;
}

export interface BOQTooltipLabels {
  viewDetail: string;
  addMenu: string;
  addSubMenu: string;
  bobotLocked?: string;
  saveFirstToFillCost?: string;
}

export interface BOQHeaderLabels {
  title: string;
  searchPlaceholder: string;
  emptyMessage: string;
  completeLabel?: string;
  fullscreenEnter: string;
  fullscreenExit: string;
  tambahButton: string;
  simpanButton: string;
}

export interface BOQCostDialogLabels {
  detailTitle: string;
  lockedTooltip: (label: string) => string;
  saveButton: string;
  savingButton: string;
}

export interface BOQCostColumnLabels {
  code: string;
  name: string;
  vol: string;
  uom: string;
  unitPrice: string;
  total: string;
  salary?: string;
  remarks: string;
}

export interface BOQResumeColumnLabels {
  kode: string;
  namaMaterial: string;
  namaEquipment: string;
  vol: string;
  rab: string;
  cco: string;
  act: string;
  uom: string;
  duration: string;
  materialCost: string;
  equipmentCost: string;
  transportationCost: string;
  original: string;
  markUp: string;
  unitPrice: string;
  total: string;
  material: string;
  transport: string;
  equipment: string;
  amount: string;
}

export interface BOQResumeDialogLabels {
  detailTitle: string;
  materialSectionTitle: string;
  equipmentSectionTitle: string;
  searchPlaceholder: string;
}

export interface BOQLabels {
  header?: Partial<BOQHeaderLabels>;
  columns?: Partial<BOQColumnLabels>;
  tooltips?: Partial<BOQTooltipLabels>;
  contextMenu?: Partial<BOQContextMenuLabels>;
  costDialog?: Partial<BOQCostDialogLabels>;
  costColumns?: Partial<BOQCostColumnLabels>;
}

export interface BOQTemplateListLabels {
  header?: Partial<BOQHeaderLabels>;
  columns?: {
    view?: string;
    name?: string;
    projectCapability?: string;
    status?: string;
  };
  contextMenu?: Partial<BOQContextMenuLabels>;
  statusFilters?: {
    all?: string;
    active?: string;
    inactive?: string;
  };
  statusBadges?: {
    active?: string;
    inactive?: string;
  };
  tooltips?: {
    unsavedChanges?: string;
  };
}

export interface BOQProjectListConfig {
  /** Dynamic third column header — e.g. "Setting BoQ", "Setting Limit Budget", "Setting CCO" */
  settingColumnLabel: string;
  /** Show the filter dropdown in the toolbar. Planning=true, Final=true, Execution=false */
  showFilter?: boolean;
  /** Placeholder text for the filter button when no value is selected */
  filterPlaceholder?: string;
  /** Options rendered in the filter DropdownMenuRadioGroup */
  filterOptions?: { value: string; label: string }[];
}
