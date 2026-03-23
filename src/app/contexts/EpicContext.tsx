import React, { createContext, useContext, useState, ReactNode } from "react";
import { Epic, UserStory } from "../types/epic";
import { initialEpics, initialUserStories } from "../data/initial-epics";

interface EpicContextType {
  epics: Epic[];
  userStories: UserStory[];
  addEpic: (epic: Epic) => void;
  updateEpic: (id: string, epic: Epic) => void;
  deleteEpic: (id: string) => void;
  addUserStory: (story: UserStory) => void;
  updateUserStory: (id: string, story: UserStory) => void;
  deleteUserStory: (id: string) => void;
  getStoriesByEpic: (epicId: string) => UserStory[];
}

const EpicContext = createContext<EpicContextType | undefined>(undefined);

export const EpicProvider = ({ children }: { children: ReactNode }) => {
  const [epics, setEpics] = useState<Epic[]>(initialEpics);
  // Sanitize imported titles by removing any leading "Imported: " prefix
  const [userStories, setUserStories] = useState<UserStory[]>(
    (initialUserStories.map((s) => ({
      ...s,
      title: s.title ? s.title.replace(/^Imported:\s*/i, "") : s.title,
    })) as unknown) as UserStory[]
  );

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

  const getStoriesByEpic = (epicId: string): UserStory[] => {
    return userStories.filter((s) => s.epicId === epicId);
  };

  return (
    <EpicContext.Provider
      value={{
        epics,
        userStories,
        addEpic,
        updateEpic,
        deleteEpic,
        addUserStory,
        updateUserStory,
        deleteUserStory,
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
