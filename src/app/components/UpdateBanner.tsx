import { useState, useEffect } from "react";
import { X, Sparkles, Check } from "lucide-react";

export function UpdateBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the update banner
    const hasSeenBanner = localStorage.getItem("rtm-update-banner-seen");
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("rtm-update-banner-seen", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative">
        <button
          onClick={handleDismiss}
          className="absolute top-0 right-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">RTM Dataset Updated!</h3>
            <p className="text-sm text-white/90 mb-3">
              Your Requirements Traceability Matrix has been updated with a streamlined RBAC/IGA dataset focused on enterprise identity and access governance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-300" />
                  <span className="text-sm font-semibold">53 Requirements</span>
                </div>
                <p className="text-xs text-white/80">Enterprise, Capability, IGA Functional, Directory, Transition</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-300" />
                  <span className="text-sm font-semibold">10 Epics</span>
                </div>
                <p className="text-xs text-white/80">Including new Directory, Workday, and AI Discovery epics</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-300" />
                  <span className="text-sm font-semibold">17 User Stories</span>
                </div>
                <p className="text-xs text-white/80">Fully traced to updated requirements</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/90">✨ All framework mappings updated</span>
              <span className="text-white/60">•</span>
              <span className="text-white/90">✨ Complete traceability maintained</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
