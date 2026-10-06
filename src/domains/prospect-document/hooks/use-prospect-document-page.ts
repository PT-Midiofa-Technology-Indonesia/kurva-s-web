'use client';

import { useCallback, useState } from 'react';

export function useProspectDocumentPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenSetting = useCallback((stage: string) => {
    setSelectedStage(stage);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedStage(null);
  }, []);

  return {
    selectedStage,
    isDrawerOpen,
    handleOpenSetting,
    handleCloseDrawer,
  };
}
