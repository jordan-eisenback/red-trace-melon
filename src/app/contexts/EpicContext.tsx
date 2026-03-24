import React, { createContext, useContext, useState, ReactNode } from "react";
import { Epic, UserStory } from "../types/epic";
import { initialEpics, initialUserStories } from "../data/initial-epics";
import { StoryMap, StoryMapOutcome, StoryMapActivity, StoryMapStep } from "../types/storymap";
import { initialStoryMap } from "../data/initial-storymap";
import { StoryJam, StoryJamNode, StoryJamEdge } from "../types/storyjam";
import { initialStoryJam } from "../data/initial-storyjam";

interface EpicContextType {
  epics: Epic[];
  userStories: UserStory[];
  storyMap: StoryMap;
  addEpic: (epic: Epic) => void;
  updateEpic: (id: string, epic: Epic) => void;
  deleteEpic: (id: string) => void;
  addUserStory: (story: UserStory) => void;
  updateUserStory: (id: string, story: UserStory) => void;
  deleteUserStory: (id: string) => void;
  addOutcome: (outcome: StoryMapOutcome) => void;
  addActivity: (outcomeId: string, activity: StoryMapActivity) => void;
  addStep: (outcomeId: string, activityId: string, step: StoryMapStep) => void;
  linkStoryToStep: (stepId: string, storyId: string) => void;
  unlinkStoryFromStep: (stepId: string, storyId: string) => void;
  getStoriesByEpic: (epicId: string) => UserStory[];
  addDetailToStory: (storyId: string, detail: any) => void;
  removeDetailFromStory: (storyId: string, detailId: string) => void;
  updateDetailOnStory: (storyId: string, detail: any) => void;
  // StoryJam (freeform board) API
  storyJam: StoryJam;
  addJamNode: (node: StoryJamNode) => void;
  updateJamNodePosition: (nodeId: string, x: number, y: number) => void;
  updateJamNode: (node: StoryJamNode) => void;
  addJamEdge: (edge: StoryJamEdge) => void;
  removeJamEdge: (edgeId: string) => void;
}

const EpicContext = createContext<EpicContextType | undefined>(undefined);

export const EpicProvider = ({ children }: { children: ReactNode }) => {
  const [epics, setEpics] = useState<Epic[]>((initialEpics as unknown) as Epic[]);
  // Sanitize imported titles by removing any leading "Imported: " prefix
  const [userStories, setUserStories] = useState<UserStory[]>(
    (initialUserStories.map((s) => ({
      ...s,
      title: s.title ? s.title.replace(/^Imported:\s*/i, "") : s.title,
    })) as unknown) as UserStory[]
  );

  const [storyMap, setStoryMap] = useState<StoryMap>(initialStoryMap);
  const [storyJam, setStoryJam] = useState<StoryJam>(initialStoryJam);

  const addEpic = (epic: Epic) => {
    setEpics((prev) => [...prev, epic]);
  };

  const updateEpic = (id: string, epic: Epic) => {
    setEpics((prev) => prev.map((e) => (e.id === id ? epic : e)));
  };

  const deleteEpic = (id: string) => {
    setEpics((prev) => prev.filter((e) => e.id !== id));
    // Also delete associated user stories
    setUserStories((prev) => prev.filter((s) => s.epicId !== id));
  };

  const addUserStory = (story: UserStory) => {
    setUserStories((prev) => [...prev, story]);
  };

  const updateUserStory = (id: string, story: UserStory) => {
    setUserStories((prev) => prev.map((s) => (s.id === id ? story : s)));
  };

  const deleteUserStory = (id: string) => {
    setUserStories((prev) => prev.filter((s) => s.id !== id));
  };

  const addDetailToStory = (storyId: string, detail: any) => {
    setUserStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, details: [...(s.details || []), detail] } : s))
    );
  };

  const removeDetailFromStory = (storyId: string, detailId: string) => {
    setUserStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, details: (s.details || []).filter((d) => d.id !== detailId) } : s
      )
    );
  };

  const updateDetailOnStory = (storyId: string, detail: any) => {
    setUserStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, details: (s.details || []).map((d) => (d.id === detail.id ? { ...d, ...detail } : d)) }
          : s
      )
    );
  };

  const getStoriesByEpic = (epicId: string): UserStory[] => {
    return userStories.filter((s) => s.epicId === epicId);
  };

  // Story map operations
  const addOutcome = (outcome: StoryMapOutcome) => {
    setStoryMap((prev) => [...prev, outcome]);
  };

  const addActivity = (outcomeId: string, activity: StoryMapActivity) => {
    setStoryMap((prev) =>
      prev.map((o) => (o.id === outcomeId ? { ...o, activities: [...(o.activities || []), activity] } : o))
    );
  };

  const addStep = (outcomeId: string, activityId: string, step: StoryMapStep) => {
    setStoryMap((prev) =>
      prev.map((o) =>
        o.id === outcomeId
          ? {
              ...o,
              activities: (o.activities || []).map((a) =>
                a.id === activityId ? { ...a, steps: [...(a.steps || []), step] } : a
              ),
            }
          : o
      )
    );
  };

  const linkStoryToStep = (stepId: string, storyId: string) => {
    setStoryMap((prev) =>
      prev.map((o) => ({
        ...o,
        activities: (o.activities || []).map((a) => ({
          ...a,
          steps: (a.steps || []).map((s) =>
            s.id === stepId ? { ...s, linkedStoryIds: Array.from(new Set([...(s.linkedStoryIds || []), storyId])) } : s
          ),
        })),
      }))
    );
  };

  const unlinkStoryFromStep = (stepId: string, storyId: string) => {
    setStoryMap((prev) =>
      prev.map((o) => ({
        ...o,
        activities: (o.activities || []).map((a) => ({
          ...a,
          steps: (a.steps || []).map((s) => (s.id === stepId ? { ...s, linkedStoryIds: (s.linkedStoryIds || []).filter((id) => id !== storyId) } : s)),
        })),
      }))
    );
  };

  // StoryJam (freeform board) operations
  const addJamNode = (node: StoryJamNode) => {
    setStoryJam((prev) => ({ ...prev, nodes: [...prev.nodes, node] }));
  };

  const updateJamNodePosition = (nodeId: string, x: number, y: number) => {
    setStoryJam((prev) => ({ ...prev, nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)) }));
  };

  const updateJamNode = (node: StoryJamNode) => {
    setStoryJam((prev) => ({ ...prev, nodes: prev.nodes.map((n) => (n.id === node.id ? { ...n, ...node } : n)) }));
  };

  const addJamEdge = (edge: StoryJamEdge) => {
    setStoryJam((prev) => ({ ...prev, edges: [...prev.edges, edge] }));
  };

  const removeJamEdge = (edgeId: string) => {
    setStoryJam((prev) => ({ ...prev, edges: prev.edges.filter((e) => e.id !== edgeId) }));
  };

  return (
    <EpicContext.Provider
      value={{
        epics,
        userStories,
        storyMap,
        storyJam,
        addEpic,
        updateEpic,
        deleteEpic,
        addUserStory,
        updateUserStory,
        deleteUserStory,
        addDetailToStory,
        removeDetailFromStory,
  updateDetailOnStory,
        addOutcome,
        addActivity,
        addStep,
        linkStoryToStep,
        unlinkStoryFromStep,
        addJamNode,
        updateJamNodePosition,
        updateJamNode,
        addJamEdge,
        removeJamEdge,
        getStoriesByEpic,
      }}
    >
      {children}
    </EpicContext.Provider>
  );
};

export const useEpics = () => {
  const context = useContext(EpicContext);
  if (context === undefined) {
    throw new Error("useEpics must be used within an EpicProvider");
  }
  return context;
};
