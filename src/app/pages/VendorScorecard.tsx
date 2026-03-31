import { useState, useMemo, useCallback } from "react";
import { useVendor } from "../contexts/VendorContext";
import { Score } from "../types/vendor";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { HelpTooltip } from "../components/HelpTooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle2, Circle, TrendingUp, Users, Building2, ClipboardList } from "lucide-react";

const VENDOR_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function VendorScorecard() {
  const {
    data,
    updateScore,
    getCompletionStatus,
    getAggregatedScores,
    getActiveCriteriaProfile,
    getActiveProfile,
  } = useVendor();

  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState<string>(
    data.evaluators[0]?.id ?? ""
  );

  const activeCriteriaProfile = getActiveCriteriaProfile();
  const activeWeightingProfile = getActiveProfile();
  const completionStatus = getCompletionStatus();
  const aggregatedScores = getAggregatedScores();

  const scaleMax =
    activeWeightingProfile?.scaleConfig.type === "1-5" ? 5 :
    activeWeightingProfile?.scaleConfig.type === "1-10" ? 10 :
    activeWeightingProfile?.scaleConfig.type === "0-3" ? 3 : 5;

  const scaleMin =
    activeWeightingProfile?.scaleConfig.type === "0-3" ? 0 : 1;

  // ---- Score lookup helpers -----------------------------------------------

  const getScore = useCallback((
    evaluatorId: string,
    vendorId: string,
    criterionId: string,
    subCriterionId: string
  ): number | undefined => {
    return data.scores.find(
      (s) =>
        s.evaluatorId === evaluatorId &&
        s.vendorId === vendorId &&
        s.criterionId === criterionId &&
        s.subCriterionId === subCriterionId
    )?.score;
  }, [data.scores]);

  const vendorCompletion = useCallback((vendorId: string) => {
    return (
      completionStatus.find(
        (s) => s.evaluatorId === selectedEvaluatorId && s.vendorId === vendorId
      ) ?? { completed: 0, total: 0, percentage: 0 }
    );
  }, [completionStatus, selectedEvaluatorId]);

  const handleScoreChange = useCallback((
    vendorId: string,
    criterionId: string,
    subCriterionId: string,
    value: string
  ) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < scaleMin || num > scaleMax) return;
    // Preserve the original createdAt if this score already exists so we don't
    // reset the audit timestamp on every edit.
    const existing = data.scores.find(
      (s) =>
        s.evaluatorId === selectedEvaluatorId &&
        s.vendorId === vendorId &&
        s.criterionId === criterionId &&
        s.subCriterionId === subCriterionId
    );
    const score: Omit<Score, "updatedAt"> = {
      id: `score-${selectedEvaluatorId}-${vendorId}-${criterionId}-${subCriterionId}`,
      evaluatorId: selectedEvaluatorId,
      vendorId,
      criterionId,
      subCriterionId,
      score: num,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    updateScore(score);
  }, [selectedEvaluatorId, scaleMin, scaleMax, data.scores, updateScore]);

  // ---- Chart data ----------------------------------------------------------

  const chartData = useMemo(
    () =>
      aggregatedScores.map((agg) => {
        const vendor = data.vendors.find((v) => v.id === agg.vendorId);
        return {
          name: vendor?.name ?? agg.vendorId,
          score: Math.round(agg.normalizedScore * 10) / 10,
          type: vendor?.type,
        };
      }),
    [aggregatedScores, data.vendors]
  );

  // ---- Empty states --------------------------------------------------------

  const noVendors = data.vendors.length === 0;
  const noEvaluators = data.evaluators.length === 0;
  const noCriteria = !activeCriteriaProfile || activeCriteriaProfile.criteria.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Vendor Scorecard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Score vendors against evaluation criteria and compare results
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {activeCriteriaProfile && (
            <Badge variant="outline">{activeCriteriaProfile.name}</Badge>
          )}
          {activeWeightingProfile && (
            <Badge variant="outline">Scale: {activeWeightingProfile.scaleConfig.type}</Badge>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{data.vendors.length}</p>
                <p className="text-xs text-gray-500">Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{data.evaluators.length}</p>
                <p className="text-xs text-gray-500">Evaluators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">
                  {activeCriteriaProfile?.criteria.reduce(
                    (sum, c) => sum + c.subCriteria.length,
                    0
                  ) ?? 0}
                </p>
                <p className="text-xs text-gray-500">Criteria</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="entry">
        <TabsList>
          <TabsTrigger value="entry">Score Entry</TabsTrigger>
          <TabsTrigger value="results">Results Dashboard</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        {/* TAB 1 — Score Entry                                              */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="entry" className="space-y-4">
          {noVendors || noEvaluators || noCriteria ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <ClipboardList className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Nothing to score yet</p>
                <p className="text-sm mt-1">
                  Add vendors, evaluators and a criteria profile in{" "}
                  <a href="/vendor-settings" className="text-indigo-600 hover:underline">
                    Vendor Settings
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Evaluator selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Scoring as:
                </label>
                <Select value={selectedEvaluatorId} onValueChange={setSelectedEvaluatorId}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select evaluator" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.evaluators.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id}>
                        {ev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <HelpTooltip content="Select which evaluator you are scoring on behalf of. Each evaluator's scores are averaged together in the results." />
              </div>

              {/* Per-vendor completion bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.vendors.map((vendor) => {
                  const comp = vendorCompletion(vendor.id);
                  return (
                    <Card key={vendor.id} className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{vendor.name}</span>
                        <Badge
                          variant={vendor.type === "existing" ? "secondary" : "outline"}
                          className="text-xs shrink-0 ml-2"
                        >
                          {vendor.type}
                        </Badge>
                      </div>
                      <Progress value={comp.percentage} className="h-1.5" />
                      <p className="text-xs text-gray-400 mt-1">
                        {comp.completed}/{comp.total} scored
                      </p>
                    </Card>
                  );
                })}
              </div>

              {/* Scoring accordion */}
              <Accordion type="multiple" className="space-y-2">
                {activeCriteriaProfile.criteria.map((criterion) => (
                  <AccordionItem
                    key={criterion.id}
                    value={criterion.id}
                    className="border rounded-lg bg-white"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="font-medium text-sm">{criterion.category}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pb-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-t border-b">
                              <th className="text-left px-4 py-2 font-medium text-gray-600 w-1/3">
                                Sub-Criterion
                              </th>
                              {data.vendors.map((v) => (
                                <th
                                  key={v.id}
                                  className="text-center px-3 py-2 font-medium text-gray-600 min-w-[120px]"
                                >
                                  {v.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {criterion.subCriteria.map((sub) => (
                              <tr key={sub.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-700">
                                  <div className="flex items-center gap-1">
                                    {sub.name}
                                    {sub.description && (
                                      <HelpTooltip content={sub.description} />
                                    )}
                                  </div>
                                </td>
                                {data.vendors.map((vendor) => {
                                  const current = getScore(
                                    selectedEvaluatorId,
                                    vendor.id,
                                    criterion.id,
                                    sub.id
                                  );
                                  return (
                                    <td key={vendor.id} className="px-3 py-2 text-center">
                                      <Select
                                        value={current !== undefined ? String(current) : ""}
                                        onValueChange={(val) =>
                                          handleScoreChange(vendor.id, criterion.id, sub.id, val)
                                        }
                                      >
                                        <SelectTrigger className="w-20 mx-auto h-8 text-xs">
                                          <SelectValue placeholder="—" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from(
                                            { length: scaleMax - scaleMin + 1 },
                                            (_, i) => scaleMin + i
                                          ).map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                              {n}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* TAB 2 — Results Dashboard                                        */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="results" className="space-y-6">
          {aggregatedScores.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No results yet</p>
                <p className="text-sm mt-1">
                  Enter scores in the Score Entry tab to see results here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Normalised score bar chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Overall Normalised Score</CardTitle>
                    <HelpTooltip content="Weighted average of all sub-criteria scores, normalised to 0–100%. Higher is better." />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => [`${v}%`, "Score"]} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, idx) => (
                          <Cell key={entry.name} fill={VENDOR_COLORS[idx % VENDOR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category breakdown table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Category</th>
                          {data.vendors.map((v) => (
                            <th
                              key={v.id}
                              className="text-center px-3 py-2 font-medium text-gray-600 min-w-[120px]"
                            >
                              {v.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {aggregatedScores[0]?.categoryScores.map((cat) => (
                          <tr key={cat.category} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-700">{cat.category}</td>
                            {aggregatedScores.map((agg) => {
                              const cs = agg.categoryScores.find(
                                (c) => c.category === cat.category
                              );
                              const pct =
                                cs && cs.maxScore > 0
                                  ? Math.round((cs.weightedScore / cs.maxScore) * 100)
                                  : null;
                              return (
                                <td key={agg.vendorId} className="px-3 py-2 text-center">
                                  {pct !== null ? (
                                    <span
                                      className={
                                        pct >= 70
                                          ? "text-emerald-600 font-medium"
                                          : pct >= 40
                                          ? "text-amber-600 font-medium"
                                          : "text-red-500 font-medium"
                                      }
                                    >
                                      {pct}%
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        {/* Totals row */}
                        <tr className="bg-gray-50 font-semibold border-t-2">
                          <td className="px-4 py-2">Overall</td>
                          {aggregatedScores.map((agg) => (
                            <td key={agg.vendorId} className="px-3 py-2 text-center">
                              {Math.round(agg.normalizedScore)}%
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Completion status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Completion Status</CardTitle>
                    <HelpTooltip content="How many sub-criteria each evaluator has scored for each vendor." />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            Evaluator
                          </th>
                          {data.vendors.map((v) => (
                            <th
                              key={v.id}
                              className="text-center px-3 py-2 font-medium text-gray-600 min-w-[140px]"
                            >
                              {v.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.evaluators.map((ev) => (
                          <tr key={ev.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-700">{ev.name}</td>
                            {data.vendors.map((vendor) => {
                              const cs = completionStatus.find(
                                (s) =>
                                  s.evaluatorId === ev.id && s.vendorId === vendor.id
                              );
                              const pct = cs?.percentage ?? 0;
                              return (
                                <td key={vendor.id} className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    {pct >= 100 ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                      <Circle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <Progress value={pct} className="h-1.5" />
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {cs?.completed ?? 0}/{cs?.total ?? 0}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
