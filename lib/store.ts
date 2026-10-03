"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as api from "./api";
import type { ChatMessage, Entity, Language, Match, Plan, Profile, Relation } from "./types";
import { uid } from "./utils";

interface NavigatorState {
  needText: string;
  profile: Profile | null;
  matches: Match[];
  plan: Plan | null;
  /** Explicit language choice on the intake page. null = detect from the text. */
  language: Language | null;
  shortlist: string[];
  notes: Record<string, string>;
  chat: ChatMessage[];

  // Not persisted
  entities: Entity[];
  relations: Relation[];
  analysing: boolean;
  chatBusy: boolean;
  detailId: string | null;
  emailId: string | null;

  setNeedText: (text: string) => void;
  setLanguage: (language: Language | null) => void;
  setProfile: (profile: Profile) => void;
  runAnalysis: () => Promise<void>;
  loadEntities: () => Promise<void>;
  toggleShortlist: (id: string) => void;
  setNote: (id: string, note: string) => void;
  sendChat: (text: string) => Promise<void>;
  openDetail: (id: string | null) => void;
  openEmail: (id: string | null) => void;
  reset: () => void;
}

export const useNavigator = create<NavigatorState>()(
  persist(
    (set, get) => ({
      needText: "",
      profile: null,
      matches: [],
      plan: null,
      language: null,
      shortlist: [],
      notes: {},
      chat: [],
      entities: [],
      relations: [],
      analysing: false,
      chatBusy: false,
      detailId: null,
      emailId: null,

      setNeedText: (needText) => set({ needText }),
      setLanguage: (language) => set({ language }),
      setProfile: (profile) => set({ profile }),

      runAnalysis: async () => {
        const { profile } = get();
        if (!profile) return;
        set({ analysing: true });
        try {
          const matches = await api.getMatches(profile);
          const plan = await api.getPlan(profile, matches);
          set({ matches, plan });
        } finally {
          set({ analysing: false });
        }
      },

      loadEntities: async () => {
        if (get().entities.length) return;
        const [entities, relations] = await Promise.all([api.getEntities(), api.getRelations()]);
        set({ entities, relations });
      },

      toggleShortlist: (id) =>
        set((s) => ({
          shortlist: s.shortlist.includes(id) ? s.shortlist.filter((x) => x !== id) : [...s.shortlist, id],
        })),

      setNote: (id, note) => set((s) => ({ notes: { ...s.notes, [id]: note } })),

      sendChat: async (text) => {
        const { profile } = get();
        if (!profile) return;
        set((s) => ({ chat: [...s.chat, { id: uid("msg"), role: "user", text }], chatBusy: true }));
        try {
          const result = await api.refine(profile, text);
          const changed = result.profile !== profile;
          set((s) => ({
            profile: result.profile,
            chat: [...s.chat, { id: uid("msg"), role: "assistant", text: result.reply }],
          }));
          if (changed) await get().runAnalysis();
        } catch {
          set((s) => ({
            chat: [
              ...s.chat,
              { id: uid("msg"), role: "assistant", text: "That request failed. Check your connection and send it again." },
            ],
          }));
        } finally {
          set({ chatBusy: false });
        }
      },

      openDetail: (detailId) => set({ detailId }),
      openEmail: (emailId) => set({ emailId }),

      reset: () =>
        set({ needText: "", profile: null, matches: [], plan: null, chat: [], detailId: null, emailId: null }),
    }),
    {
      name: "basel-navigator-v2",
      partialize: (s) => ({
        needText: s.needText,
        profile: s.profile,
        matches: s.matches,
        plan: s.plan,
        language: s.language,
        shortlist: s.shortlist,
        notes: s.notes,
        chat: s.chat,
      }),
    },
  ),
);

/** True after the first client render, once persisted state is safe to show. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
