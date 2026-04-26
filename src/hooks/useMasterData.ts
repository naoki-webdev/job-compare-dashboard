import { useCallback, useEffect, useState } from "react";

import {
  createLocation,
  createPosition,
  createTechStack,
  deleteLocation,
  deletePosition,
  deleteTechStack,
  fetchLocations,
  fetchPositions,
  fetchTechStacks,
  getApiErrorMessage,
  updateLocation,
  updatePosition,
  updateTechStack,
} from "../api/jobs";
import { t } from "../i18n";
import type { MasterDataItem, MasterDataPayload } from "../types/job";
import { retry } from "../utils/retry";

export function useMasterData() {
  const [locations, setLocations] = useState<MasterDataItem[]>([]);
  const [positions, setPositions] = useState<MasterDataItem[]>([]);
  const [techStacks, setTechStacks] = useState<MasterDataItem[]>([]);
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [submittingMasterData, setSubmittingMasterData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [masterDataError, setMasterDataError] = useState<string | null>(null);

  const loadMasters = useCallback(async () => {
    setLoadError(null);

    try {
      const [locationItems, positionItems, techStackItems] = await retry(
        () =>
          Promise.all([
            fetchLocations(),
            fetchPositions(),
            fetchTechStacks(),
          ]),
      );
      setLocations(locationItems);
      setPositions(positionItems);
      setTechStacks(techStackItems);
    } catch {
      setLoadError(t("errors.fetch_master_data"));
    }
  }, []);

  useEffect(() => {
    void loadMasters();
  }, [loadMasters]);

  const handleOpenMasterData = useCallback(() => {
    setMasterDataError(null);
    setMasterDataOpen(true);
  }, []);

  const handleCloseMasterData = useCallback(() => {
    setMasterDataOpen(false);
    setMasterDataError(null);
  }, []);

  const runMutation = useCallback(async (action: () => Promise<void>) => {
    setSubmittingMasterData(true);
    setMasterDataError(null);

    try {
      await action();
      await loadMasters();
      return true;
    } catch (error) {
      setMasterDataError(getApiErrorMessage(error, t("errors.update_master_data")));
      return false;
    } finally {
      setSubmittingMasterData(false);
    }
  }, [loadMasters]);

  const handleCreatePosition = useCallback(
    (payload: MasterDataPayload) => runMutation(async () => { await createPosition(payload); }),
    [runMutation],
  );
  const handleUpdatePosition = useCallback(
    (id: number, payload: MasterDataPayload) => runMutation(async () => { await updatePosition(id, payload); }),
    [runMutation],
  );
  const handleDeletePosition = useCallback(
    (id: number) => runMutation(async () => { await deletePosition(id); }),
    [runMutation],
  );
  const handleCreateLocation = useCallback(
    (payload: MasterDataPayload) => runMutation(async () => { await createLocation(payload); }),
    [runMutation],
  );
  const handleUpdateLocation = useCallback(
    (id: number, payload: MasterDataPayload) => runMutation(async () => { await updateLocation(id, payload); }),
    [runMutation],
  );
  const handleDeleteLocation = useCallback(
    (id: number) => runMutation(async () => { await deleteLocation(id); }),
    [runMutation],
  );
  const handleCreateTechStack = useCallback(
    (payload: MasterDataPayload) => runMutation(async () => { await createTechStack(payload); }),
    [runMutation],
  );
  const handleUpdateTechStack = useCallback(
    (id: number, payload: MasterDataPayload) => runMutation(async () => { await updateTechStack(id, payload); }),
    [runMutation],
  );
  const handleDeleteTechStack = useCallback(
    (id: number) => runMutation(async () => { await deleteTechStack(id); }),
    [runMutation],
  );

  return {
    locations,
    positions,
    techStacks,
    masterDataOpen,
    submittingMasterData,
    loadError,
    masterDataError,
    loadMasters,
    handleOpenMasterData,
    handleCloseMasterData,
    handleCreatePosition,
    handleUpdatePosition,
    handleDeletePosition,
    handleCreateLocation,
    handleUpdateLocation,
    handleDeleteLocation,
    handleCreateTechStack,
    handleUpdateTechStack,
    handleDeleteTechStack,
  };
}
