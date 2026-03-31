import { useState, useMemo, useEffect } from "react";
import { useRequirements } from "../contexts/RequirementsContext";
import { useVendor } from "../contexts/VendorContext";
import { Requirement } from "../types/requirement";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Checkbox } from "../components/ui/checkbox";
import { HelpTooltip } from "../components/HelpTooltip";
import { Search, Link2, Link2Off, AlertTriangle, CheckCircle2, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router";

// ---------------------------------------------------------------------------
// Mapping modal
// ---------------------------------------------------------------------------

interface MappingModalProps {
  requirement: Requirement;
  onClose: () => void;
}

function MappingModal({ requirement, onClose }: MappingModalProps) {
  const {
    getActiveCriteriaProfile,
    linkRequirementToCriterion,
    unlinkRequirementFromCriterion,
    getRequirementsForCriterion,
  } = useVendor();

  const profile = getActiveCriteriaProfile();

  function isLinked(subCriterionId: string) {
    return getRequirementsForCriterion(subCriterionId).includes(requirement.id);
  }

  function toggle(subCriterionId: string) {
    if (isLinked(subCriterionId)) {
      unlinkRequirementFromCriterion(subCriterionId, requirement.id);
      toast.success("Link removed");
    } else {
      linkRequirementToCriterion(subCriterionId, requirement.id);
      toast.success("Link added");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Map Vendor Criteria — {requirement.id}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{requirement.req}</p>
        </DialogHeader>

        {!profile ? (
          <p className="text-sm text-gray-500 py-4">No active criteria profile found.</p>
        ) : (
          <Accordion type="multiple" className="space-y-1 mt-2">
            {profile.criteria.map((criterion) => (
              <AccordionItem
                key={criterion.id}
                value={criterion.id}
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-3 py-2 hover:no-underline text-sm font-medium">
                  {criterion.category}
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-2">
                  {criterion.subCriteria.map((sub) => (
                    <label
                      key={sub.id}
                      className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 rounded p-1"
                    >
                      <Checkbox
                        checked={isLinked(sub.id)}
                        onCheckedChange={() => toggle(sub.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm text-gray-800">{sub.name}</p>
                        {sub.description && (
                          <p className="text-xs text-gray-400">{sub.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function RequirementCoverage() {
  const { requirements } = useRequirements();
  const {
    data,
    getActiveCriteriaProfile,
    getCriteriaForRequirement,
  } = useVendor();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mappingFilter, setMappingFilter] = useState<"all" | "mapped" | "unmapped">("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [mappingTarget, setMappingTarget] = useState<Requirement | null>(null);

  // Pre-populate search from ?search= query param (e.g. from GapAnalysisPanel deep-link)
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");
    if (q) setSearchTerm(q);
  }, [location.search]);

  const profile = useMemo(
    () => getActiveCriteriaProfile(),
     
    [getActiveCriteriaProfile]
  );

  // Unique types from requirements
  const types = useMemo(
    () => Array.from(new Set(requirements.map((r) => r.type))).sort(),
    [requirements]
  );

  // For each requirement, compute linked criteria and per-vendor avg score
  // using raw sub-criterion scores (not category-level aggregation) so the
  // displayed score reflects only the criteria actually linked to this requirement.
  const rows = useMemo(() => {
    return requirements.map((req) => {
      const linkedCriteria = getCriteriaForRequirement(req.id);

      const vendorScores = data.vendors.map((vendor) => {
        if (linkedCriteria.length === 0) return { vendorId: vendor.id, score: null as number | null };

        // Collect all raw scores for this vendor on each linked sub-criterion,
        // averaging across evaluators, then averaging across linked sub-criteria.
        const subScores: number[] = [];
        linkedCriteria.forEach(({ criterion, subCriterionId }) => {
          const scoresForSub = data.scores.filter(
            (s) =>
              s.vendorId === vendor.id &&
              s.criterionId === criterion.id &&
              s.subCriterionId === subCriterionId
          );
          if (scoresForSub.length > 0) {
            const avg = scoresForSub.reduce((acc, s) => acc + s.score, 0) / scoresForSub.length;
            subScores.push(avg);
          }
        });

        if (subScores.length === 0) return { vendorId: vendor.id, score: null as number | null };

        // Normalise to 0–100 using the active weighting profile's scale max
        const scaleMax =
          data.weightingProfiles.find((p) => p.id === data.activeProfileId)
            ?.scaleConfig.type === "1-5" ? 5
            : data.weightingProfiles.find((p) => p.id === data.activeProfileId)
              ?.scaleConfig.type === "1-10" ? 10
            : data.weightingProfiles.find((p) => p.id === data.activeProfileId)
              ?.scaleConfig.type === "0-3" ? 3
            : 5;
        const rawAvg = subScores.reduce((a, b) => a + b, 0) / subScores.length;
        return {
          vendorId: vendor.id,
          score: Math.round((rawAvg / scaleMax) * 100),
        };
      });

      const vendorsWithScore = vendorScores.filter((v) => v.score !== null).length;
      const coveragePct =
        linkedCriteria.length > 0 && data.vendors.length > 0
          ? Math.round((vendorsWithScore / data.vendors.length) * 100)
          : 0;

      return { req, linkedCriteria, vendorScores, coveragePct };
    });
  }, [requirements, getCriteriaForRequirement, data.vendors, data.scores, data.weightingProfiles, data.activeProfileId]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter(({ req, linkedCriteria, vendorScores }) => {
      if (
        searchTerm &&
        !req.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !req.req.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;

      if (typeFilter !== "all" && req.type !== typeFilter) return false;

      if (mappingFilter === "mapped" && linkedCriteria.length === 0) return false;
      if (mappingFilter === "unmapped" && linkedCriteria.length > 0) return false;

      if (vendorFilter !== "all") {
        const vs = vendorScores.find((v) => v.vendorId === vendorFilter);
        if (!vs || vs.score === null) return false;
      }

      return true;
    });
  }, [rows, searchTerm, typeFilter, mappingFilter, vendorFilter]);

  // Summary stats
  const totalMapped = rows.filter((r) => r.linkedCriteria.length > 0).length;
  const totalUnmapped = rows.length - totalMapped;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Requirement Coverage</h2>
          <p className="mt-1 text-sm text-gray-500">
            Trace requirements to vendor evaluation criteria and see how vendors score against them
          </p>
        </div>
        <HelpTooltip content="This matrix links each requirement to vendor scoring criteria, showing which vendors cover each requirement and how well they score." />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <BarChart2 className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{requirements.length}</p>
                <p className="text-xs text-gray-500">Total Requirements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{totalMapped}</p>
                <p className="text-xs text-gray-500">
                  Linked to criteria ({requirements.length > 0 ? Math.round((totalMapped / requirements.length) * 100) : 0}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{totalUnmapped}</p>
                <p className="text-xs text-gray-500">No vendor coverage (gap)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mappingFilter} onValueChange={(v) => setMappingFilter(v as "all" | "mapped" | "unmapped")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All requirements</SelectItem>
            <SelectItem value="mapped">Mapped only</SelectItem>
            <SelectItem value="unmapped">Unmapped (gaps)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={vendorFilter} onValueChange={setVendorFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All vendors</SelectItem>
            {data.vendors.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Matrix */}
      {!profile ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <BarChart2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No criteria profile active</p>
            <p className="text-sm mt-1">
              Configure a criteria profile in{" "}
              <a href="/vendor-settings" className="text-indigo-600 hover:underline">
                Vendor Settings
              </a>{" "}
              to start linking requirements.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-48 min-w-[180px]">
                      Requirement
                    </th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600 w-24">Type</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600 min-w-[200px]">
                      Linked Criteria
                    </th>
                    {data.vendors.map((v) => (
                      <th
                        key={v.id}
                        className="text-center px-3 py-3 font-medium text-gray-600 min-w-[110px]"
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="truncate max-w-[100px]">{v.name}</span>
                          <Badge
                            variant={v.type === "existing" ? "secondary" : "outline"}
                            className="text-[10px] py-0"
                          >
                            {v.type}
                          </Badge>
                        </div>
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 font-medium text-gray-600 w-24">
                      Coverage
                    </th>
                    <th className="px-3 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5 + data.vendors.length}
                        className="px-4 py-10 text-center text-gray-400"
                      >
                        No requirements match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map(({ req, linkedCriteria, vendorScores, coveragePct }) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        {/* Requirement */}
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-indigo-600">{req.id}</p>
                          <p className="text-gray-700 text-xs mt-0.5 line-clamp-2">{req.req}</p>
                        </td>

                        {/* Type */}
                        <td className="px-3 py-3">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {req.type}
                          </Badge>
                        </td>

                        {/* Linked criteria chips */}
                        <td className="px-3 py-3">
                          {linkedCriteria.length === 0 ? (
                            <span className="text-gray-300 text-xs">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {linkedCriteria.map(({ criterion, subCriterionId, subCriterionName }) => (
                                <Badge
                                  key={subCriterionId}
                                  variant="secondary"
                                  className="text-[10px] max-w-[160px] truncate"
                                  title={`${criterion.category} › ${subCriterionName}`}
                                >
                                  {subCriterionName}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Per-vendor scores */}
                        {vendorScores.map((vs) => (
                          <td key={vs.vendorId} className="px-3 py-3 text-center">
                            {vs.score === null ? (
                              <span className="text-gray-300">—</span>
                            ) : (
                              <span
                                className={
                                  vs.score >= 70
                                    ? "text-emerald-600 font-semibold"
                                    : vs.score >= 40
                                    ? "text-amber-600 font-semibold"
                                    : "text-red-500 font-semibold"
                                }
                              >
                                {vs.score}%
                              </span>
                            )}
                          </td>
                        ))}

                        {/* Coverage % */}
                        <td className="px-3 py-3 text-center">
                          {linkedCriteria.length === 0 ? (
                            <span title="No criteria linked">
                              <AlertTriangle className="h-4 w-4 text-amber-400 mx-auto" />
                            </span>
                          ) : (
                            <span
                              className={
                                coveragePct >= 70
                                  ? "text-emerald-600 font-semibold text-sm"
                                  : coveragePct >= 40
                                  ? "text-amber-600 font-semibold text-sm"
                                  : "text-red-500 font-semibold text-sm"
                              }
                            >
                              {coveragePct}%
                            </span>
                          )}
                        </td>

                        {/* Map button */}
                        <td className="px-3 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Manage criterion links"
                            onClick={() => setMappingTarget(req)}
                          >
                            {linkedCriteria.length > 0 ? (
                              <Link2 className="h-4 w-4 text-indigo-500" />
                            ) : (
                              <Link2Off className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mapping modal */}
      {mappingTarget && (
        <MappingModal
          requirement={mappingTarget}
          onClose={() => setMappingTarget(null)}
        />
      )}
    </div>
  );
}
