import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function KeyboardShortcuts({ onNewRequirement }: { onNewRequirement?: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + K - Search (future feature)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toast.info("Search coming soon!");
      }

      // Ctrl/Cmd + N - New Requirement
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        onNewRequirement?.();
      }

      // G then R - Go to Requirements
      if (e.key === "g") {
        setTimeout(() => {
          const nextKey = (event: KeyboardEvent) => {
            if (event.key === "r") navigate("/");
            if (event.key === "d") navigate("/dependencies");
            if (event.key === "h") navigate("/hierarchy");
            if (event.key === "s") navigate("/story-mapping");
            if (event.key === "e") navigate("/epics-stories");
            if (event.key === "f") navigate("/frameworks");
            window.removeEventListener("keydown", nextKey);
          };
          window.addEventListener("keydown", nextKey);
          setTimeout(() => window.removeEventListener("keydown", nextKey), 2000);
        }, 100);
      }

      // ? - Show keyboard shortcuts
      if (e.key === "?") {
        e.preventDefault();
        showShortcutsHelp();
      }

      // Escape - Close dialogs (handled by components)
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, onNewRequirement]);

  const showShortcutsHelp = () => {
    toast.info(
      <div className="space-y-2">
        <div className="font-semibold mb-2">Keyboard Shortcuts</div>
        <div className="space-y-1 text-sm">
          <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl+N</kbd> New Requirement</div>
          <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">G</kbd> then <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">R</kbd> Go to Requirements</div>
          <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">G</kbd> then <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">D</kbd> Go to Dependencies</div>
          <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">G</kbd> then <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">H</kbd> Go to Hierarchy</div>
          <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">G</kbd> then <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">F</kbd> Go to Frameworks</div>
          <div><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">?</kbd> Show this help</div>
        </div>
      </div>,
      { duration: 8000 }
    );
  };

  return null;
}
