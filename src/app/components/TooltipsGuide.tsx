import { useState } from "react";
import { X, HelpCircle, Sparkles, Download, Network, Shield, Users, FileText } from "lucide-react";

interface TooltipsGuideProps {
  open: boolean;
  onClose: () => void;
}

export function TooltipsGuide({ open, onClose }: TooltipsGuideProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!open) return null;

  const pages = [
    {
      title: "Welcome to RTM Pro Tooltips!",
      description: "We've added helpful tooltips throughout the application to guide you. Here's a quick tour of where to find help.",
      icon: HelpCircle,
      color: "purple",
    },
    {
      title: "Button Tooltips",
      description: "Hover over any button to see what it does. Try the 'Export to Excel' and 'Show Validation' buttons on the Requirements List page.",
      icon: Sparkles,
      color: "blue",
      examples: [
        "Export to Excel - Comprehensive export with 8 sheets",
        "Show Validation - Toggle AI-powered quality checks",
        "View Details - Navigate to requirement details",
      ],
    },
    {
      title: "Form Field Help",
      description: "Look for the help icon (?) next to form field labels. Click them to learn what each field does and best practices for filling it out.",
      icon: FileText,
      color: "green",
      examples: [
        "ID - Naming conventions and format",
        "Type - Requirement classifications",
        "Parent - Creating hierarchical relationships",
      ],
    },
    {
      title: "Feature Icons",
      description: "Status icons throughout the app have tooltips explaining what they mean. Hover to learn more!",
      icon: Shield,
      color: "orange",
      examples: [
        "✓ Green checkmark - Requirement is mapped",
        "⚠ Orange warning - Not mapped to any framework",
        "Score indicators - Quality and validation status",
      ],
    },
    {
      title: "Navigation Help",
      description: "Visit the Help Center (accessible from the navigation) for comprehensive FAQs, guides, and documentation about all features.",
      icon: Users,
      color: "purple",
    },
  ];

  const currentPageData = pages[currentPage];
  const Icon = currentPageData.icon;

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onClose();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const colorClasses = {
    purple: "from-purple-600 to-purple-700",
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    orange: "from-orange-600 to-orange-700",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorClasses[currentPageData.color as keyof typeof colorClasses]} p-6 text-white`}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-2">{currentPageData.title}</h2>
          <p className="text-white/90">{currentPageData.description}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentPageData.examples && (
            <div className="space-y-3">
              {currentPageData.examples.map((example, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{example}</p>
                </div>
              ))}
            </div>
          )}

          {!currentPageData.examples && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-12 h-12 text-purple-600" />
              </div>
              <p className="text-gray-600 max-w-md mx-auto">
                {currentPage === 0 ? "Hover over buttons and icons to see helpful tooltips throughout the application!" : "You're all set! Enjoy using RTM Pro with helpful tooltips everywhere."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {pages.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentPage
                      ? "w-8 bg-purple-600"
                      : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {currentPage > 0 && (
                <button
                  onClick={prevPage}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={nextPage}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {currentPage < pages.length - 1 ? "Next" : "Get Started"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}