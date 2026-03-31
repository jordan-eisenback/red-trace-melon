import { createContext, useContext, ReactNode } from "react";
import { Epic, UserStory, StoryDetail } from "../types/epic";
import { initialEpics, initialUserStories } from "../data/initial-epics";
import { StoryMap, StoryMapOutcome, StoryMapActivity, StoryMapStep } from "../types/storymap";
import { initialStoryMap } from "../data/initial-storymap";
import { StoryJam, StoryJamNode, StoryJamEdge } from "../types/storyjam";
import { initialStoryJam } from "../data/initial-storyjam";
import { useLocalStorage } from "../hooks/useLocalStorage";

/** Build the seeded UserStory list with linkedStepIds populated from the initial story map. */
function buildInitialUserStories(): UserStory[] {
  const reverseIndex: Record<string, string[]> = {};
  for (const outcome of initialStoryMap) {
    for (const activity of outcome.activities ?? []) {
      for (const step of activity.steps ?? []) {
        for (const sid of step.linkedStoryIds ?? []) {
          if (!reverseIndex[sid]) reverseIndex[sid] = [];
          if (!reverseIndex[sid].includes(step.id)) reverseIndex[sid].push(step.id);
        }
      }
    }
  }
  return (initialUserStories.map((s) => ({
    ...s,
    title: s.title ? s.title.replace(/^Imported:\s*/i, "") : s.title,
    linkedStepIds: reverseIndex[s.id] ?? [],
  })) as unknown) as UserStory[];
}

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
  updateOutcome: (id: string, patch: Partial<StoryMapOutcome>) => void;
  deleteOutcome: (id: string) => void;
  addActivity: (outcomeId: string, activity: StoryMapActivity) => void;
  updateActivity: (outcomeId: string, activityId: string, patch: Partial<StoryMapActivity>) => void;
  deleteActivity: (outcomeId: string, activityId: string) => void;
  addStep: (outcomeId: string, activityId: string, step: StoryMapStep) => void;
  updateStep: (outcomeId: string, activityId: string, stepId: string, patch: Partial<StoryMapStep>) => void;
  deleteStep: (outcomeId: string, activityId: string, stepId: string) => void;
  linkStoryToStep: (stepId: string, storyId: string) => void;
  unlinkStoryFromStep: (stepId: string, storyId: string) => void;
  getStoriesByEpic: (epicId: string) => UserStory[];
  addDetailToStory: (storyId: string, detail: StoryDetail) => void;
  removeDetailFromStory: (storyId: string, detailId: string) => void;
  updateDetailOnStory: (storyId: string, detail: StoryDetail) => void;
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
  const [epics, setEpics] = useLocalStorage<Epic[]>("rtm-epics", (initialEpics as unknown) as Epic[]);
  const [userStories, setUserStories] = useLocalStorage<UserStory[]>("rtm-user-stories", buildInitialUserStories());
  const [storyMap, setStoryMap] = useLocalStorage<StoryMap>("rtm-story-map", initialStoryMap);
  const [storyJam, setStoryJam] = useLocalStorage<StoryJam>("rtm-story-jam", initialStoryJam);

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

  const addDetailToStory = (storyId: string, detail: StoryDetail) => {
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

  const updateDetailOnStory = (storyId: string, detail: StoryDetail) => {
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

  const updateOutcome = (id: string, patch: Partial<StoryMapOutcome>) => {
    setStoryMap((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const deleteOutcome = (id: string) => {
    setStoryMap((prev) => prev.filter((o) => o.id !== id));
  };

  const addActivity = (outcomeId: string, activity: StoryMapActivity) => {
    setStoryMap((prev) =>
      prev.map((o) => (o.id === outcomeId ? { ...o, activities: [...(o.activities || []), activity] } : o))
    );
  };

  const updateActivity = (outcomeId: string, activityId: string, patch: Partial<StoryMapActivity>) => {
    setStoryMap((prev) =>
      prev.map((o) =>
        o.id === outcomeId
          ? { ...o, activities: (o.activities || []).map((a) => (a.id === activityId ? { ...a, ...patch } : a)) }
          : o
      )
    );
  };

  const deleteActivity = (outcomeId: string, activityId: string) => {
    setStoryMap((prev) =>
      prev.map((o) =>
        o.id === outcomeId
          ? { ...o, activities: (o.activities || []).filter((a) => a.id !== activityId) }
          : o
      )
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

  const updateStep = (outcomeId: string, activityId: string, stepId: string, patch: Partial<StoryMapStep>) => {
    setStoryMap((prev) =>
      prev.map((o) =>
        o.id === outcomeId
          ? {
              ...o,
              activities: (o.activities || []).map((a) =>
                a.id === activityId
                  ? { ...a, steps: (a.steps || []).map((s) => (s.id === stepId ? { ...s, ...patch } : s)) }
                  : a
              ),
            }
          : o
      )
    );
  };

  const deleteStep = (outcomeId: string, activityId: string, stepId: string) => {
    // First capture the step's linked stories so we can clean up the reverse index
    let orphanedStoryIds: string[] = [];
    setStoryMap((prev) => {
      prev.forEach((o) => {
        if (o.id !== outcomeId) return;
        (o.activities || []).forEach((a) => {
          if (a.id !== activityId) return;
          const step = (a.steps || []).find((s) => s.id === stepId);
          if (step) orphanedStoryIds = step.linkedStoryIds ?? [];
        });
      });
      return prev.map((o) =>
        o.id === outcomeId
          ? {
              ...o,
              activities: (o.activities || []).map((a) =>
                a.id === activityId ? { ...a, steps: (a.steps || []).filter((s) => s.id !== stepId) } : a
              ),
            }
          : o
      );
    });
    // Remove stepId from each formerly-linked story's linkedStepIds
    if (orphanedStoryIds.length > 0) {
      setUserStories((prev) =>
        prev.map((s) =>
          orphanedStoryIds.includes(s.id)
            ? { ...s, linkedStepIds: (s.linkedStepIds || []).filter((id) => id !== stepId) }
            : s
        )
      );
    }
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
    // Mirror: add stepId to the story's linkedStepIds
    setUserStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, linkedStepIds: Array.from(new Set([...(s.linkedStepIds || []), stepId])) }
          : s
      )
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
    // Mirror: remove stepId from the story's linkedStepIds
    setUserStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, linkedStepIds: (s.linkedStepIds || []).filter((id) => id !== stepId) }
          : s
      )
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
        updateOutcome,
        deleteOutcome,
        addActivity,
        updateActivity,
        deleteActivity,
        addStep,
        updateStep,
        deleteStep,
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
