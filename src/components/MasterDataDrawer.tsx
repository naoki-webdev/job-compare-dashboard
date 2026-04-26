import { memo, useEffect, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { t } from "../i18n";
import type { MasterDataItem, MasterDataPayload, ScoringPreference, ScoringPreferencePayload } from "../types/job";
import MasterDataSection from "./MasterDataSection";
import {
  emptyMasterData,
  emptyScoringValues,
  hasEmptyScoringField,
  type MasterDataDraft,
  type ScoringPreferenceDraft,
  toScoringPreferencePayload,
} from "./masterDataDrafts";
import ScoringRuleSection from "./ScoringRuleSection";

type MasterDataDrawerProps = {
  open: boolean;
  preference: ScoringPreference | null;
  locations: MasterDataItem[];
  positions: MasterDataItem[];
  techStacks: MasterDataItem[];
  submittingScoring: boolean;
  submittingMasterData: boolean;
  scoringError?: string | null;
  masterDataError?: string | null;
  onClose: () => void;
  onSubmitScoring: (payload: ScoringPreferencePayload) => Promise<void> | void;
  onCreateLocation: (payload: MasterDataPayload) => Promise<void> | void;
  onUpdateLocation: (id: number, payload: MasterDataPayload) => Promise<void> | void;
  onDeleteLocation: (id: number) => Promise<void> | void;
  onCreatePosition: (payload: MasterDataPayload) => Promise<void> | void;
  onUpdatePosition: (id: number, payload: MasterDataPayload) => Promise<void> | void;
  onDeletePosition: (id: number) => Promise<void> | void;
  onCreateTechStack: (payload: MasterDataPayload) => Promise<void> | void;
  onUpdateTechStack: (id: number, payload: MasterDataPayload) => Promise<void> | void;
  onDeleteTechStack: (id: number) => Promise<void> | void;
};

function MasterDataDrawer({
  open,
  preference,
  locations,
  positions,
  techStacks,
  submittingScoring,
  submittingMasterData,
  scoringError,
  masterDataError,
  onClose,
  onSubmitScoring,
  onCreateLocation,
  onUpdateLocation,
  onDeleteLocation,
  onCreatePosition,
  onUpdatePosition,
  onDeletePosition,
  onCreateTechStack,
  onUpdateTechStack,
  onDeleteTechStack,
}: MasterDataDrawerProps) {
  const [newLocation, setNewLocation] = useState<MasterDataDraft>(emptyMasterData);
  const [newPosition, setNewPosition] = useState<MasterDataDraft>(emptyMasterData);
  const [newTechStack, setNewTechStack] = useState<MasterDataDraft>(emptyMasterData);
  const [scoringValues, setScoringValues] = useState<ScoringPreferenceDraft>(emptyScoringValues);

  useEffect(() => {
    if (open) {
      setNewLocation({ ...emptyMasterData, display_order: locations.length });
      setNewPosition({ ...emptyMasterData, display_order: positions.length });
      setNewTechStack({ ...emptyMasterData, display_order: techStacks.length });
    }
  }, [open, locations.length, positions.length, techStacks.length]);

  useEffect(() => {
    if (open && preference) {
      setScoringValues({
        full_remote_weight: preference.full_remote_weight,
        hybrid_weight: preference.hybrid_weight,
        onsite_weight: preference.onsite_weight,
        high_salary_max_threshold: preference.high_salary_max_threshold,
        high_salary_bonus: preference.high_salary_bonus,
        low_salary_min_threshold: preference.low_salary_min_threshold,
        low_salary_penalty: preference.low_salary_penalty,
      });
    }
  }, [open, preference]);

  const handleScoringChange = (key: keyof ScoringPreferenceDraft, value: number | "") => {
    setScoringValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(9, 30, 66, 0.1)" } } }}
    >
      <Box
        sx={{
          width: { xs: 360, sm: 620 },
          backgroundColor: "#f5f7fb",
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6">{t("settings.title")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("settings.helper")}
              </Typography>
            </Box>

            <ScoringRuleSection
              values={scoringValues}
              error={scoringError}
              onChange={handleScoringChange}
            />

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t("settings.items_title")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.items_helper")}
                  </Typography>
                </Box>

                {masterDataError && <Alert severity="error">{masterDataError}</Alert>}

                <MasterDataSection
                  title={t("master_data.locations")}
                  nameLabel={t("master_data.location_name")}
                  namePlaceholder={t("master_data.location_placeholder")}
                  items={locations}
                  newItem={newLocation}
                  submitting={submittingMasterData}
                  onNewItemChange={setNewLocation}
                  onCreate={async (payload) => {
                    await onCreateLocation(payload);
                    setNewLocation({ ...emptyMasterData, display_order: locations.length + 1 });
                  }}
                  onUpdate={onUpdateLocation}
                  onDelete={onDeleteLocation}
                />

                <Divider />

                <MasterDataSection
                  title={t("master_data.positions")}
                  nameLabel={t("master_data.position_name")}
                  namePlaceholder={t("master_data.position_placeholder")}
                  items={positions}
                  newItem={newPosition}
                  submitting={submittingMasterData}
                  onNewItemChange={setNewPosition}
                  onCreate={async (payload) => {
                    await onCreatePosition(payload);
                    setNewPosition({ ...emptyMasterData, display_order: positions.length + 1 });
                  }}
                  onUpdate={onUpdatePosition}
                  onDelete={onDeletePosition}
                />

                <Divider />

                <MasterDataSection
                  title={t("master_data.tech_stacks")}
                  nameLabel={t("master_data.tech_stack_name")}
                  namePlaceholder={t("master_data.tech_stack_placeholder")}
                  items={techStacks}
                  newItem={newTechStack}
                  submitting={submittingMasterData}
                  onNewItemChange={setNewTechStack}
                  onCreate={async (payload) => {
                    await onCreateTechStack(payload);
                    setNewTechStack({ ...emptyMasterData, display_order: techStacks.length + 1 });
                  }}
                  onUpdate={onUpdateTechStack}
                  onDelete={onDeleteTechStack}
                />
              </Stack>
            </Paper>
          </Stack>
        </Box>

        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "rgba(245, 247, 251, 0.96)",
            borderTop: "1px solid rgba(15, 23, 42, 0.08)",
            px: 3,
            py: 2,
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="text" onClick={onClose}>
              {t("actions.close")}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const payload = toScoringPreferencePayload(scoringValues);
                if (!payload) return;
                void onSubmitScoring(payload);
              }}
              disabled={submittingScoring || hasEmptyScoringField(scoringValues)}
            >
              {submittingScoring ? t("actions.saving") : t("actions.save_scoring")}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

export default memo(MasterDataDrawer);
