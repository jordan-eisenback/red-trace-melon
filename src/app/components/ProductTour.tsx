import { useState, useEffect } from "react";
import { X, ArrowRight, Check } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  highlight?: boolean;
}

interface ProductTourProps {
  active: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='validation-panel']",
    title: "AI-Powered Validation",
    content: "This panel shows your requirement quality score and provides smart suggestions for improvements. Click 'Auto-Fix All' to resolve common issues instantly.",
    position: "bottom",
    highlight: true,
  },
  {
    target: "[data-tour='search-filter']",
    title: "Search & Filter",
    content: "Quickly find requirements by ID, description, or owner. Filter by requirement type to focus on specific categories.",
    position: "bottom",
  },
  {
    target: "[data-tour='requirements-table']",
    title: "Requirements Table",
    content: "View all requirements in a comprehensive table. Click any row to see detailed information, or use the action buttons to edit or delete.",
    position: "top",
  },
  {
    target: "[data-tour='nav-dependencies']",
    title: "Dependency Graph",
    content: "Navigate to the visual dependency graph to see how requirements relate to each other in an interactive network diagram.",
    position: "bottom",
  },
  {
    target: "[data-tour='nav-frameworks']",
    title: "Framework Mapping",
    content: "Map requirements to compliance frameworks like SOX, NIST 800-53, ISO 27001, and COBIT. Get AI-powered mapping suggestions.",
    position: "bottom",
  },
  {
    target: "[data-tour='nav-stories']",
    title: "Agile Integration",
    content: "Connect requirements to Epics and User Stories. View the story map to see how requirements translate into deliverables.",
    position: "bottom",
  },
];

export function ProductTour({ active, onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!active) return;

    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;

    if (element) {
      setTargetElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 360;
      const tooltipHeight = 200;
      
      let top = 0;
      let left = 0;

      switch (step.position) {
        case "bottom":
          top = rect.bottom + 16;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "top":
          top = rect.top - tooltipHeight - 16;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - 16;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 16;
          break;
      }

      // Ensure tooltip stays on screen
      const padding = 16;
      if (left < padding) left = padding;
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }
      if (top < padding) top = padding;

      setTooltipPosition({ top, left });

      // Add highlight class
      if (step.highlight) {
        element.classList.add("tour-highlight");
      }
    }

    return () => {
      if (element && step.highlight) {
        element.classList.remove("tour-highlight");
      }
    };
  }, [currentStep, active]);

  if (!active || !targetElement) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onSkip} />

      {/* Spotlight */}
      {targetElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
            boxShadow: "0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)",
            borderRadius: "8px",
            transition: "all 0.3s ease",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl border-2 border-purple-500 overflow-hidden"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: "360px",
          transition: "all 0.3s ease",
        }}
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
              <p className="text-sm text-purple-100 mt-1">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-gray-700 text-sm leading-relaxed">{currentStepData.content}</p>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-purple-600 w-6"
                    : index < currentStep
                    ? "bg-purple-400"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
