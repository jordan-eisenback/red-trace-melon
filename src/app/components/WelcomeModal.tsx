import { useState } from "react";
import { X, Check, ArrowRight, Sparkles, Network, FileText, Shield, Zap, Users } from "lucide-react";
import { useRequirements } from "../context/RequirementsContext";
import { useFrameworks } from "../contexts/FrameworkContext";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export function WelcomeModal({ open, onClose, onStartTour }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { requirements } = useRequirements();
  const { frameworks } = useFrameworks();

  if (!open) return null;

  const steps = [
    {
      title: "Welcome to RTM Pro",
      subtitle: "Requirements Traceability Matrix for RBAC Governance",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            You're now using a comprehensive Requirements Traceability Matrix (RTM) application designed to manage, 
            visualize, and govern <strong>Role-Based Access Control (RBAC)</strong> requirements across your enterprise.
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">What is an RTM?</h4>
            <p className="text-sm text-purple-800">
              A Requirements Traceability Matrix tracks requirements throughout their lifecycle, ensuring complete 
              coverage, compliance, and auditability. It connects requirements to frameworks, user stories, and epics 
              to provide full visibility into implementation status.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{requirements.length}</div>
              <div className="text-xs text-gray-600 mt-1">Requirements</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{frameworks.length}</div>
              <div className="text-xs text-gray-600 mt-1">Frameworks</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {frameworks.reduce((acc, f) => acc + f.controls.length, 0)}
              </div>
              <div className="text-xs text-gray-600 mt-1">Controls</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Key Features",
      subtitle: "Everything you need for requirement management",
      icon: Zap,
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-blue-900 text-sm">Multiple Views</h5>
              <p className="text-xs text-blue-700 mt-1">
                Tabular lists, detailed views, interactive dependency graphs, hierarchical trees, and more
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <Network className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-purple-900 text-sm">Framework Mapping</h5>
              <p className="text-xs text-purple-700 mt-1">
                Map requirements to SOX, NIST 800-53, ISO 27001, and COBIT compliance controls
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-green-900 text-sm">Agile Integration</h5>
              <p className="text-xs text-green-700 mt-1">
                Connect requirements to Epics and User Stories with visual story mapping
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Sparkles className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-orange-900 text-sm">AI-Powered Validation</h5>
              <p className="text-xs text-orange-700 mt-1">
                Automatic quality checks, smart suggestions, and one-click fixes for requirement issues
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Shield className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-indigo-900 text-sm">Full CRUD Operations</h5>
              <p className="text-xs text-indigo-700 mt-1">
                Create, read, update, delete requirements with parent-child relationships and dependencies
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Understanding the Data",
      subtitle: "Pre-loaded RBAC requirements explained",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            This application comes pre-loaded with <strong>167 real-world RBAC requirements</strong> spanning 
            enterprise governance, capabilities, and integration requirements.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h5 className="font-semibold text-gray-900 text-sm">Requirement Types:</h5>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Enterprise</strong> - High-level strategic requirements (E1-E6)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Capability Category</strong> - Grouped capabilities (1-8)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Capability</strong> - Detailed functional requirements (1.1, 2.3, etc.)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700"><strong>IGA Functional</strong> - Integration requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Non-Functional</strong> - Performance, security, constraints</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This workspace uses a canonical requirement naming convention (e.g. <code>RBAC-ENT-001</code>, <code>RBAC-CAP-109</code>, <code>RBAC-IGA-025</code>) to make types and domains explicit. See the project naming doc <em>(NAMING_CONVENTION_UPDATE.md)</em> for details. You may also notice IDs like <code>RBAC-INT-012</code> which represent interface requirements such as directory event logging.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Example:</strong> RBAC-REQ-4.1 (Capability) is a child of RBAC-REQ-4 (Capability Category), 
              which is a child of RBAC-REQ-E3 (Enterprise). This hierarchy provides traceability from strategy to implementation.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Navigation Guide",
      subtitle: "Explore different views and features",
      icon: Network,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 mb-4">
            The application provides multiple specialized views to help you work with requirements effectively:
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-900 text-sm">Requirements List</h5>
                <p className="text-xs text-gray-600">Main view with search, filters, and validation panel</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                <Network className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-900 text-sm">Dependency Graph</h5>
                <p className="text-xs text-gray-600">Interactive visual map of requirement relationships</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-900 text-sm">Story Mapping</h5>
                <p className="text-xs text-gray-600">User story map showing epics and stories linked to requirements</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-900 text-sm">Frameworks & Controls</h5>
                <p className="text-xs text-gray-600">Compliance framework mapping with smart suggestions</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-900 text-sm">Tree View</h5>
                <p className="text-xs text-gray-600">Hierarchical parent-child requirement structure</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Get Started?",
      subtitle: "Choose how you'd like to proceed",
      icon: Check,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            You're all set! Here are some recommended next steps:
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                onStartTour();
                onClose();
              }}
              className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-between group"
            >
              <div className="text-left">
                <div className="font-semibold">Take the Interactive Tour</div>
                <div className="text-sm text-purple-100">Guided walkthrough of key features (5 min)</div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onClose}
              className="w-full p-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-between group"
            >
              <div className="text-left">
                <div className="font-semibold">Explore on Your Own</div>
                <div className="text-sm text-gray-600">Browse requirements and features independently</div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h5 className="font-semibold text-gray-900 text-sm mb-2">Quick Tips:</h5>
            <ul className="space-y-1 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                Click the <strong>Validation panel</strong> to check requirement quality
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                Use <strong>search and filters</strong> to find specific requirements
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                Click any requirement ID to see detailed information
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                Access <strong>Help Center</strong> anytime from the top navigation
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                <p className="text-purple-100 text-sm mt-1">{currentStepData.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-white"
                    : index < currentStep
                    ? "bg-white/60"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
