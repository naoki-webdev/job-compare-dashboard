import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import MasterDataDrawer from "./MasterDataDrawer";

const preference = {
  id: 1,
  full_remote_weight: 30,
  hybrid_weight: 15,
  onsite_weight: 0,
  high_salary_max_threshold: 8_000_000,
  high_salary_bonus: 10,
  low_salary_min_threshold: 4_000_000,
  low_salary_penalty: -10,
  created_at: "2026-04-05T00:00:00.000Z",
  updated_at: "2026-04-05T00:00:00.000Z",
};

const locations = [{ id: 1, name: "東京", score_weight: 6, active: true, display_order: 0 }];
const positions = [{ id: 2, name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0 }];
const techStacks = [{ id: 3, name: "Ruby on Rails", score_weight: 20, active: true, display_order: 0 }];

const defaultProps = {
  open: true,
  preference,
  locations,
  positions,
  techStacks,
  submittingScoring: false,
  submittingMasterData: false,
  scoringError: null,
  masterDataError: null,
  onClose: vi.fn(),
  onSubmitScoring: vi.fn(),
  onCreateLocation: vi.fn(),
  onUpdateLocation: vi.fn(),
  onDeleteLocation: vi.fn(),
  onCreatePosition: vi.fn(),
  onUpdatePosition: vi.fn(),
  onDeletePosition: vi.fn(),
  onCreateTechStack: vi.fn(),
  onUpdateTechStack: vi.fn(),
  onDeleteTechStack: vi.fn(),
};

describe("MasterDataDrawer", () => {
  it("renders the settings sections and existing master data", () => {
    render(<MasterDataDrawer {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "スコア設定" })).toBeInTheDocument();
    expect(screen.getByText("勤務地・職種・技術スタック")).toBeInTheDocument();
    expect(screen.getByDisplayValue("東京")).toBeInTheDocument();
    expect(screen.getByDisplayValue("バックエンドエンジニア")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ruby on Rails")).toBeInTheDocument();
  });

  it("submits normalized scoring values", async () => {
    const user = userEvent.setup();
    const onSubmitScoring = vi.fn();

    render(<MasterDataDrawer {...defaultProps} onSubmitScoring={onSubmitScoring} />);

    const fullRemoteWeight = screen.getByRole("spinbutton", { name: "フルリモートの重み" });
    await user.clear(fullRemoteWeight);
    await user.type(fullRemoteWeight, "40");
    await user.click(screen.getByRole("button", { name: "働き方・年収を保存" }));

    expect(onSubmitScoring).toHaveBeenCalledWith({
      full_remote_weight: 40,
      hybrid_weight: 15,
      onsite_weight: 0,
      high_salary_max_threshold: 8_000_000,
      high_salary_bonus: 10,
      low_salary_min_threshold: 4_000_000,
      low_salary_penalty: -10,
    });
  });

  it("creates a new location from the draft inputs", async () => {
    const user = userEvent.setup();
    const onCreateLocation = vi.fn();

    render(<MasterDataDrawer {...defaultProps} onCreateLocation={onCreateLocation} />);

    const locationNameInputs = screen.getAllByLabelText("勤務地名");
    const weightInputs = screen.getAllByLabelText("重み");
    const orderInputs = screen.getAllByLabelText("表示順");

    await user.clear(locationNameInputs[1]);
    await user.type(locationNameInputs[1], "大阪");
    await user.clear(weightInputs[1]);
    await user.type(weightInputs[1], "4");
    await user.clear(orderInputs[1]);
    await user.type(orderInputs[1], "1");

    await user.click(screen.getByRole("button", { name: "勤務地を追加" }));

    expect(onCreateLocation).toHaveBeenCalledWith({
      name: "大阪",
      score_weight: 4,
      active: true,
      display_order: 1,
    });
  });

  it("updates an existing position with normalized values", async () => {
    const user = userEvent.setup();
    const onUpdatePosition = vi.fn();

    render(<MasterDataDrawer {...defaultProps} onUpdatePosition={onUpdatePosition} />);

    const positionNameInput = screen.getByDisplayValue("バックエンドエンジニア");
    const positionCard = positionNameInput.parentElement?.parentElement?.parentElement?.parentElement;
    if (!positionCard) {
      throw new Error("position card not found");
    }

    await user.clear(positionNameInput);
    await user.type(positionNameInput, "バックエンドアーキテクト");
    await user.click(within(positionCard).getByRole("button", { name: "バックエンドアーキテクトを保存" }));

    expect(onUpdatePosition).toHaveBeenCalledWith(2, {
      name: "バックエンドアーキテクト",
      score_weight: 8,
      active: true,
      display_order: 0,
    });
  });
});
