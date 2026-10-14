"use client";

import { useCallback } from "react";
import { useT } from "@/components/site-provider";
import { NEED_META, STAGE_LABEL, THERAPEUTIC_AREA_LABELS, TYPE_META } from "./entity-meta";
import type { TextKey } from "./texts";
import type { EntityType, NeedCategory, Stage } from "./types";

// Names of types, needs, stages and fields, editable in the admin panel
// ("Need and type names"). The tables in entity-meta.ts stay the defaults.

export function useTypeLabel() {
  const t = useT();
  return useCallback((type: EntityType) => (TYPE_META[type] ? t(`types.${type}` as TextKey) : type), [t]);
}

export function useNeedLabel() {
  const t = useT();
  return useCallback((need: NeedCategory) => (NEED_META[need] ? t(`needs.${need}` as TextKey) : need), [t]);
}

/** The detail text a need starts with when it is added on the profile page. */
export function useNeedDetail() {
  const t = useT();
  return useCallback((need: NeedCategory) => (NEED_META[need] ? t(`needs.${need}.detail` as TextKey) : need), [t]);
}

export function useStageLabel() {
  const t = useT();
  return useCallback((stage: Stage) => (STAGE_LABEL[stage] ? t(`stages.${stage}` as TextKey) : stage), [t]);
}

export function useAreaLabel() {
  const t = useT();
  return useCallback(
    (area: string) =>
      THERAPEUTIC_AREA_LABELS[area] ? t(`areas.${area.replace(/[^a-z0-9_.-]/g, "_")}` as TextKey) : area,
    [t],
  );
}
