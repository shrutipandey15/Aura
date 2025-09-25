/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Keep this import
import {
  Agent,
  Charlotte,
  Paul,
  Shane,
  Penny,
  Quinn,
} from './presets/agents';

/**
 * User
 */
export type User = {
  name?: string;
  info?: string;
};

export const useUser = create<
  {
    setName: (name: string) => void;
    setInfo: (info: string) => void;
  } & User
>(set => ({
  name: '',
  info: '',
  setName: name => set({ name }),
  setInfo: info => set({ info }),
}));

/**
 * Agents
 */
interface AgentState {
  current: Agent;
  availablePresets: Agent[];
  availablePersonal: Agent[];
  setCurrent: (agent: Agent | string) => void;
  addAgent: (agent: Agent) => void;
  update: (agentId: string, adjustments: Partial<Agent>) => void;
}

export const useAgent = create<AgentState>()(
  persist(
    (set, get) => ({
      current: Paul,
      availablePresets: [Paul, Charlotte, Shane, Penny, Quinn],
      availablePersonal: [],

      addAgent: (agent: Agent) => {
        set(state => ({
          availablePersonal: [...state.availablePersonal, agent],
          current: agent,
        }));
      },
      setCurrent: (agent: Agent | string) => {
        const { availablePersonal, availablePresets } = get();
        const agentToSet =
          typeof agent === 'string'
            ? availablePersonal.find(a => a.id === agent) ||
              availablePresets.find(a => a.id === agent)
            : agent;
        if (agentToSet) {
          set({ current: agentToSet });
        } else {
          console.warn(`Agent not found for identifier:`, agent);
        }
      },
      update: (agentId: string, adjustments: Partial<Agent>) => {
        set(state => {
          const agent =
            state.availablePersonal.find(a => a.id === agentId) ||
            state.availablePresets.find(a => a.id === agentId);

          if (!agent) return state;

          const updatedAgent = { ...agent, ...adjustments };

          return {
            availablePresets: state.availablePresets.map(a =>
              a.id === agentId ? updatedAgent : a
            ),
            availablePersonal: state.availablePersonal.map(a =>
              a.id === agentId ? updatedAgent : a
            ),
            current: state.current.id === agentId ? updatedAgent : state.current,
          };
        });
      },
    }),
    {
      name: 'aura-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ availablePersonal: state.availablePersonal }),
    }
  )
);


/**
 * UI
 */
export const useUI = create<{
  showUserConfig: boolean;
  setShowUserConfig: (show: boolean) => void;
  showAgentEdit: boolean;
  setShowAgentEdit: (show: boolean) => void;
}>(set => ({
  showUserConfig: true,
  setShowUserConfig: (show: boolean) => set({ showUserConfig: show }),
  showAgentEdit: false,
  setShowAgentEdit: (show: boolean) => set({ showAgentEdit: show }),
}));