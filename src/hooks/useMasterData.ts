import { useCallback, useEffect, useState } from "react";

import {
  createInterviewQuestion,
  createLocation,
  createNegativeKeyword,
  createPositiveKeyword,
  createPosition,
  createTechStack,
  deleteInterviewQuestion,
  deleteLocation,
  deleteNegativeKeyword,
  deletePositiveKeyword,
  deletePosition,
  deleteTechStack,
  fetchInterviewQuestions,
  fetchLocations,
  fetchNegativeKeywords,
  fetchPositiveKeywords,
  fetchPositions,
  fetchTechStacks,
  getApiErrorMessage,
  updateInterviewQuestion,
  updateLocation,
  updateNegativeKeyword,
  updatePositiveKeyword,
  updatePosition,
  updateTechStack,
} from "../api/jobs";
import { t } from "../i18n";
import type {
  EvaluationKeywordItem,
  EvaluationKeywordPayload,
  InterviewQuestionItem,
  InterviewQuestionPayload,
  MasterDataItem,
  MasterDataPayload,
} from "../types/job";
import { retry } from "../utils/retry";

export function useMasterData() {
  const [locations, setLocations] = useState<MasterDataItem[]>([]);
  const [positions, setPositions] = useState<MasterDataItem[]>([]);
  const [techStacks, setTechStacks] = useState<MasterDataItem[]>([]);
  const [positiveKeywords, setPositiveKeywords] = useState<EvaluationKeywordItem[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<EvaluationKeywordItem[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionItem[]>([]);
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [submittingMasterData, setSubmittingMasterData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [masterDataError, setMasterDataError] = useState<string | null>(null);

  const loadMasters = useCallback(async () => {
    setLoadError(null);

    try {
      const [
        locationItems,
        positionItems,
        techStackItems,
        positiveKeywordItems,
        negativeKeywordItems,
        interviewQuestionItems,
      ] = await retry(
        () =>
          Promise.all([
            fetchLocations(),
            fetchPositions(),
            fetchTechStacks(),
            fetchPositiveKeywords(),
            fetchNegativeKeywords(),
            fetchInterviewQuestions(),
          ]),
      );
      setLocations(locationItems);
      setPositions(positionItems);
      setTechStacks(techStackItems);
      setPositiveKeywords(positiveKeywordItems);
      setNegativeKeywords(negativeKeywordItems);
      setInterviewQuestions(interviewQuestionItems);
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
  const handleCreatePositiveKeyword = useCallback(
    (payload: EvaluationKeywordPayload) => runMutation(async () => { await createPositiveKeyword(payload); }),
    [runMutation],
  );
  const handleUpdatePositiveKeyword = useCallback(
    (id: number, payload: EvaluationKeywordPayload) =>
      runMutation(async () => { await updatePositiveKeyword(id, payload); }),
    [runMutation],
  );
  const handleDeletePositiveKeyword = useCallback(
    (id: number) => runMutation(async () => { await deletePositiveKeyword(id); }),
    [runMutation],
  );
  const handleCreateNegativeKeyword = useCallback(
    (payload: EvaluationKeywordPayload) => runMutation(async () => { await createNegativeKeyword(payload); }),
    [runMutation],
  );
  const handleUpdateNegativeKeyword = useCallback(
    (id: number, payload: EvaluationKeywordPayload) =>
      runMutation(async () => { await updateNegativeKeyword(id, payload); }),
    [runMutation],
  );
  const handleDeleteNegativeKeyword = useCallback(
    (id: number) => runMutation(async () => { await deleteNegativeKeyword(id); }),
    [runMutation],
  );
  const handleCreateInterviewQuestion = useCallback(
    (payload: InterviewQuestionPayload) => runMutation(async () => { await createInterviewQuestion(payload); }),
    [runMutation],
  );
  const handleUpdateInterviewQuestion = useCallback(
    (id: number, payload: InterviewQuestionPayload) =>
      runMutation(async () => { await updateInterviewQuestion(id, payload); }),
    [runMutation],
  );
  const handleDeleteInterviewQuestion = useCallback(
    (id: number) => runMutation(async () => { await deleteInterviewQuestion(id); }),
    [runMutation],
  );

  return {
    locations,
    positions,
    techStacks,
    positiveKeywords,
    negativeKeywords,
    interviewQuestions,
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
    handleCreatePositiveKeyword,
    handleUpdatePositiveKeyword,
    handleDeletePositiveKeyword,
    handleCreateNegativeKeyword,
    handleUpdateNegativeKeyword,
    handleDeleteNegativeKeyword,
    handleCreateInterviewQuestion,
    handleUpdateInterviewQuestion,
    handleDeleteInterviewQuestion,
  };
}
