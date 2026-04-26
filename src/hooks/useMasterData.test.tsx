import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../api/jobs";
import type { MasterDataPayload } from "../types/job";
import { useMasterData } from "./useMasterData";
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
  updateLocation,
  updatePosition,
  updateTechStack,
} from "../api/jobs";

vi.mock("../api/jobs", async () => {
  const actual = await vi.importActual<typeof import("../api/jobs")>("../api/jobs");

  return {
    ...actual,
    createLocation: vi.fn(),
    createPosition: vi.fn(),
    createTechStack: vi.fn(),
    deleteLocation: vi.fn(),
    deletePosition: vi.fn(),
    deleteTechStack: vi.fn(),
    fetchLocations: vi.fn(),
    fetchPositions: vi.fn(),
    fetchTechStacks: vi.fn(),
    updateLocation: vi.fn(),
    updatePosition: vi.fn(),
    updateTechStack: vi.fn(),
  };
});

const mockedCreateLocation = vi.mocked(createLocation);
const mockedCreatePosition = vi.mocked(createPosition);
const mockedCreateTechStack = vi.mocked(createTechStack);
const mockedDeleteLocation = vi.mocked(deleteLocation);
const mockedDeletePosition = vi.mocked(deletePosition);
const mockedDeleteTechStack = vi.mocked(deleteTechStack);
const mockedFetchLocations = vi.mocked(fetchLocations);
const mockedFetchPositions = vi.mocked(fetchPositions);
const mockedFetchTechStacks = vi.mocked(fetchTechStacks);
const mockedUpdateLocation = vi.mocked(updateLocation);
const mockedUpdatePosition = vi.mocked(updatePosition);
const mockedUpdateTechStack = vi.mocked(updateTechStack);

const locationItems = [{ id: 1, name: "東京", score_weight: 6, active: true, display_order: 0 }];
const positionItems = [{ id: 2, name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0 }];
const techStackItems = [{ id: 3, name: "Ruby on Rails", score_weight: 20, active: true, display_order: 0 }];

beforeEach(() => {
  mockedFetchLocations.mockResolvedValue(locationItems);
  mockedFetchPositions.mockResolvedValue(positionItems);
  mockedFetchTechStacks.mockResolvedValue(techStackItems);
  mockedCreateLocation.mockResolvedValue(locationItems[0]);
  mockedCreatePosition.mockResolvedValue(positionItems[0]);
  mockedCreateTechStack.mockResolvedValue(techStackItems[0]);
  mockedDeleteLocation.mockResolvedValue(undefined);
  mockedDeletePosition.mockResolvedValue(undefined);
  mockedDeleteTechStack.mockResolvedValue(undefined);
  mockedUpdateLocation.mockResolvedValue(locationItems[0]);
  mockedUpdatePosition.mockResolvedValue(positionItems[0]);
  mockedUpdateTechStack.mockResolvedValue(techStackItems[0]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useMasterData", () => {
  it("loads all master data on mount", async () => {
    const { result } = renderHook(() => useMasterData());

    await waitFor(() => {
      expect(result.current.locations).toEqual(locationItems);
    });

    expect(result.current.positions).toEqual(positionItems);
    expect(result.current.techStacks).toEqual(techStackItems);
    expect(result.current.loadError).toBeNull();
  });

  it("creates a position and reloads the master data", async () => {
    const payload: MasterDataPayload = { name: "テックリード", score_weight: 15, active: true, display_order: 1 };
    const { result } = renderHook(() => useMasterData());

    await waitFor(() => expect(mockedFetchPositions).toHaveBeenCalledTimes(1));
    mockedFetchLocations.mockClear();
    mockedFetchPositions.mockClear();
    mockedFetchTechStacks.mockClear();

    await act(async () => {
      await result.current.handleCreatePosition(payload);
    });

    expect(mockedCreatePosition).toHaveBeenCalledWith(payload);
    expect(mockedFetchLocations).toHaveBeenCalledTimes(1);
    expect(mockedFetchPositions).toHaveBeenCalledTimes(1);
    expect(mockedFetchTechStacks).toHaveBeenCalledTimes(1);
    expect(result.current.masterDataError).toBeNull();
  });

  it("stores an error when a master-data mutation fails", async () => {
    mockedDeleteTechStack.mockRejectedValueOnce(new ApiError(422, "Name can't be blank", ["Name can't be blank"]));

    const { result } = renderHook(() => useMasterData());

    await waitFor(() => expect(mockedFetchTechStacks).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.handleDeleteTechStack(3);
    });

    expect(result.current.masterDataError).toBe("Name can't be blank");
    expect(result.current.submittingMasterData).toBe(false);
  });

  it("opens and closes the master-data drawer while resetting errors", async () => {
    mockedUpdateLocation.mockRejectedValueOnce(new ApiError(422, "Name can't be blank", ["Name can't be blank"]));

    const { result } = renderHook(() => useMasterData());

    await waitFor(() => expect(mockedFetchLocations).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.handleUpdateLocation(1, { name: "大阪", score_weight: 4, active: true, display_order: 1 });
    });

    expect(result.current.masterDataError).toBe("Name can't be blank");

    act(() => {
      result.current.handleOpenMasterData();
    });

    expect(result.current.masterDataOpen).toBe(true);
    expect(result.current.masterDataError).toBeNull();

    act(() => {
      result.current.handleCloseMasterData();
    });

    expect(result.current.masterDataOpen).toBe(false);
  });
});
