"use client";

import { useEffect } from "react";
import { useNavigator } from "@/lib/store";
import { EntityDrawer } from "./entity-drawer";
import { EmailModal } from "./email-modal";

/** App-wide overlays, mounted once in the root layout. */
export function Overlays() {
  const loadEntities = useNavigator((s) => s.loadEntities);
  useEffect(() => {
    void loadEntities();
  }, [loadEntities]);

  return (
    <>
      <EntityDrawer />
      <EmailModal />
    </>
  );
}
