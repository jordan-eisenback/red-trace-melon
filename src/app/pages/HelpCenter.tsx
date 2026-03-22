import { useState } from "react";
import {
  BookOpen,
  Search,
  HelpCircle,
  Video,
  MessageCircle,
  FileText,
  Network,
  Shield,
  Users,
  Sparkles,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Lightbulb,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "What is a Requirements Traceability Matrix (RTM)?",
    answer: "An RTM is a document that links requirements throughout the validation process. It ensures that all requirements are tested and met, providing complete traceability from initial requirements through implementation and testing. In this application, it connects RBAC requirements to frameworks, controls, epics, and user stories.",
  },
  {
    category: "Getting Started",
    question: "What are the 167 pre-loaded requirements?",
    answer: "The application contains 167 real-world Role-Based Access Control (RBAC) requirements covering Enterprise strategy, Capability categories, detailed Capabilities, IGA integration, and Non-functional requirements. They're organized hierarchically with parent-child relationships for complete traceability.",
  },
  {
    category: "Requirements",
    question: "How do I create a new requirement?",
    answer: "Click the '+ New Requirement' button in the top navigation. Fill in the required fields (ID, description, type, owner) and optional fields (parent, outcome, notes). The system will validate your input and show any issues before saving.",
  },
  {
    category: "Requirements",
    question: "What's the difference between requirement types?",
    answer: "Enterprise requirements are high-level strategic goals. Capability Categories group related capabilities. Capabilities are detailed functional requirements. IGA Functional requirements cover integration. Non-Functional requirements address performance, security, and constraints.",
  },
  {
    category: "Requirements",
    question: "How do parent-child relationships work?",
    answer: "Requirements can have a parent requirement, creating a hierarchy. For example, RBAC-REQ-4.1 is a child of RBAC-REQ-4, which is a child of RBAC-REQ-E3. This creates traceability from strategy to implementation. The Dependency Graph and Tree View visualize these relationships.",
  },
  {
    category: "Validation",
    question: "What is the Quality Score?",
    answer: "The Quality Score (0-100) measures your requirements' health. It deducts points for errors (-5), warnings (-2), and info issues (-0.5). A score above 90 is excellent, 70-89 is good, 50-69 needs improvement, and below 50 requires immediate attention.",
  },
  {
    category: "Validation",
    question: "What can be auto-fixed?",
    answer: "The system can automatically fix missing owners (assigns default), orphaned parent references (removes invalid links), circular dependencies (breaks loops), and outcome phrasing issues (improves grammar). Click 'Auto-Fix All' to resolve all fixable issues at once.",
  },
  {
    category: "Validation",
    question: "What are Smart Suggestions?",
    answer: "Smart Suggestions provide actionable recommendations for improving your RTM. They include consolidating duplicate requirements, promoting important requirements, adding missing relationships, creating epics for unmapped requirements, enhancing documentation, and creating user stories. Each suggestion can be applied with one click.",
  },
  {
    category: "Frameworks",
    question: "Which compliance frameworks are supported?",
    answer: "The application includes SOX (Sarbanes-Oxley), NIST 800-53 Rev 5, ISO 27001:2022, and COBIT 2019. These frameworks contain 25 total controls that can be mapped to requirements for compliance traceability.",
  },
  {
    category: "Frameworks",
    question: "How does framework mapping work?",
    answer: "Navigate to Frameworks & Controls, select a framework, then click a control's 'Map Requirements' button. The system provides AI-powered suggestions based on keyword matching. Click suggested requirements to map them, or search manually. Mappings are bidirectional and visible in both views.",
  },
  {
    category: "Frameworks",
    question: "What is the Bulk Mapping Tool?",
    answer: "The Bulk Mapping Tool allows you to manage multiple framework mappings at once. It provides AI-powered suggestions with relevance scores, batch selection capabilities, and the ability to add or remove mappings across multiple requirements and controls simultaneously.",
  },
  {
    category: "Epics & Stories",
    question: "How are requirements connected to user stories?",
    answer: "Requirements can be linked to Epics and User Stories. Each Epic contains multiple User Stories, and each User Story references one or more requirements. The Story Mapping view shows this relationship visually, helping translate governance requirements into agile deliverables.",
  },
  {
    category: "Epics & Stories",
    question: "What is User Story Mapping?",
    answer: "User Story Mapping is a visual technique that organizes user stories into a map showing the user's journey. In this application, it displays Epics horizontally and their User Stories vertically, with connected requirements visible. This helps prioritize work and see the big picture.",
  },
  {
    category: "Views",
    question: "What's the difference between the various views?",
    answer: "Requirements List is the main table view with search/filters. Dependency Graph shows visual relationships. Tree View displays hierarchical structure. Story Mapping connects requirements to epics/stories. Frameworks & Controls shows compliance mappings. Each view serves a different analysis purpose.",
  },
  {
    category: "Views",
    question: "How do I use the Dependency Graph?",
    answer: "The Dependency Graph visualizes requirement relationships as an interactive network. Drag nodes to rearrange, zoom in/out, filter by type, and click nodes to see details. Lines show parent-child relationships. Use the controls to focus on specific requirement types or search for particular items.",
  },
  {
    category: "Data Management",
    question: "Is my data saved automatically?",
    answer: "Yes! All changes are automatically saved to your browser's local storage. This means your data persists across sessions, but it's stored locally (not in the cloud). If you clear browser data, you'll lose custom changes and revert to the default 167 requirements.",
  },
  {
    category: "Data Management",
    question: "How do I export my RTM to Excel?",
    answer: "Click the 'Export to Excel' button on the Requirements List page. The system generates a comprehensive Excel workbook with 8 sheets: Requirements, Dependencies, Framework Mappings, Controls, Epics, User Stories, Summary, and a complete Traceability Matrix. The file includes all 167 requirements, 200+ framework mappings, epics, and user stories.",
  },
  {
    category: "Data Management",
    question: "What's included in the Excel export?",
    answer: "The Excel export includes 8 sheets: (1) Requirements with all details, (2) Dependencies showing parent-child relationships, (3) Framework Mappings linking requirements to controls, (4) Controls from all frameworks, (5) Epics with mapped requirements, (6) User Stories with acceptance criteria, (7) Summary with statistics, and (8) Complete Traceability Matrix showing all cross-references.",
  },
  {
    category: "Getting Started",
    question: "Where can I find the canonical requirement naming convention?",
    answer: "We use a canonical naming convention (e.g. RBAC-ENT-001, RBAC-CAP-109, RBAC-IGA-025) to make requirement types and domains explicit. See the Naming Convention document in the repo (NAMING_CONVENTION_UPDATE.md) or open the Help Center link 'View All Requirements' to explore IDs used in this workspace.",
  },
  {
    category: "Getting Started",
    question: "I see IDs like RBAC-INT-012 — what do they mean?",
    answer: "IDs follow a Type-Domain-Number pattern. For example RBAC-INT-012 indicates an Interface requirement (INT) in the RBAC domain; RBAC-INT-012 was added to represent directory event logging (creates/updates/deletes). Use the Requirements List to click through and see details for any ID.",
  },
];

const quickLinks = [
  {
    title: "View All Requirements",
    description: "Browse the complete list of 167 RBAC requirements",
    icon: FileText,
    link: "/",
    color: "blue",
  },
  {
    title: "Dependency Graph",
    description: "Visualize requirement relationships",
    icon: Network,
    link: "/dependencies",
    color: "purple",
  },
  {
    title: "Frameworks & Controls",
    description: "Map requirements to compliance frameworks",
    icon: Shield,
    link: "/frameworks",
    color: "green",
  },
  {
    title: "Story Mapping",
    description: "Connect requirements to epics and stories",
    icon: Users,
    link: "/story-mapping",
    color: "orange",
  },
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(faqs.map((faq) => faq.category)))];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Help Center</h1>
            <p className="text-purple-100 mt-1">Everything you need to know about RTM Pro</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
          <input
            type="text"
            placeholder="Search for help articles, FAQs, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Quick Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const colorClasses = {
              blue: "bg-blue-100 text-blue-600 border-blue-200",
              purple: "bg-purple-100 text-purple-600 border-purple-200",
              green: "bg-green-100 text-green-600 border-green-200",
              orange: "bg-orange-100 text-orange-600 border-orange-200",
            };

            return (
              <a
                key={link.title}
                href={link.link}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colorClasses[link.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-600">{link.description}</p>
                <div className="mt-3 text-sm text-purple-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Go <ChevronRight className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
          <p className="text-sm text-gray-700 mb-4">
            Comprehensive guides on using every feature of RTM Pro
          </p>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View Docs <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
          <p className="text-sm text-gray-700 mb-4">
            Watch step-by-step guides for common workflows
          </p>
          <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Watch Videos <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Get Support</h3>
          <p className="text-sm text-gray-700 mb-4">
            Contact our team for personalized assistance
          </p>
          <button className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1">
            Contact Us <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.map((faq, index) => (
            <details
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden group"
            >
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {faq.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90 flex-shrink-0" />
              </summary>
              <div className="px-6 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No FAQs found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}