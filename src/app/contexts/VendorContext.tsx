import { createContext, useContext, useCallback, ReactNode } from "react";
import {
  VendorAppData,
  Vendor,
  Evaluator,
  Criterion,
  CriteriaProfile,
  WeightingProfile,
  Score,
  CompletionStatus,
  AggregatedScore,
} from "../types/vendor";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  parseCriteriaFromCSV,
  parseCriteriaFromCSVContent,
  exportCriteriaToCSV,
  validateCSV,
  getDefaultWeights,
} from "../utils/vendorCsvParser";

// ---------------------------------------------------------------------------
// Initial data
// ---------------------------------------------------------------------------

function getInitialVendorData(): VendorAppData {
  const criteria = parseCriteriaFromCSV();
  const now = new Date().toISOString();

  const defaultCriteriaProfile: CriteriaProfile = {
    id: "criteria-profile-default",
    name: "Identity Governance Comparison",
    description: "Standard identity governance evaluation criteria",
    criteria,
    createdAt: now,
    updatedAt: now,
  };

  return {
    vendors: [
      { id: "vendor-1", name: "Current Vendor (Cayosoft)", type: "existing", createdAt: now },
      { id: "vendor-2", name: "Replacement Option 1 (Netwrix)", type: "replacement", createdAt: now },
      { id: "vendor-3", name: "Replacement Option 2", type: "replacement", createdAt: now },
    ],
    evaluators: [
      { id: "eval-1", name: "Default Evaluator", email: "evaluator@example.com", createdAt: now },
    ],
    criteriaProfiles: [defaultCriteriaProfile],
    activeCriteriaProfileId: defaultCriteriaProfile.id,
    weightingProfiles: [
      {
        id: "weighting-profile-default",
        name: "Default Profile",
        description: "Equal weighting across all criteria",
        scaleConfig: { type: "1-5" },
        scoringMode: "sub-criteria",
        weights: getDefaultWeights(criteria),
        createdAt: now,
        updatedAt: now,
      },
    ],
    activeProfileId: "weighting-profile-default",
    scores: [],
  };
}

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface VendorContextType {
  data: VendorAppData;

  // Vendors
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt">) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  // Evaluators
  addEvaluator: (evaluator: Omit<Evaluator, "id" | "createdAt">) => void;
  updateEvaluator: (id: string, updates: Partial<Evaluator>) => void;
  deleteEvaluator: (id: string) => void;

  // Criteria Profiles
  addCriteriaProfile: (profile: Omit<CriteriaProfile, "id" | "createdAt" | "updatedAt">) => void;
  updateCriteriaProfile: (id: string, updates: Partial<Omit<CriteriaProfile, "id" | "createdAt">>) => void;
  deleteCriteriaProfile: (id: string) => void;
  setActiveCriteriaProfile: (id: string) => void;
  importCriteriaProfileFromCSV: (
    name: string,
    csvContent: string,
    description?: string
  ) => { success: boolean; errors?: string[]; warnings?: string[]; profileId?: string };
  exportCriteriaProfileToCSV: (profileId: string) => string | null;
  getActiveCriteriaProfile: () => CriteriaProfile | undefined;

  // Criteria (within active profile)
  addCriterion: (criterion: Omit<Criterion, "id">) => void;
  updateCriterion: (id: string, updates: Partial<Criterion>) => void;
  deleteCriterion: (id: string) => void;

  // Weighting Profiles
  addWeightingProfile: (profile: Omit<WeightingProfile, "id" | "createdAt" | "updatedAt">) => void;
  updateWeightingProfile: (id: string, updates: Partial<WeightingProfile>) => void;
  deleteWeightingProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  getActiveProfile: () => WeightingProfile | undefined;

  // Scores
  updateScore: (score: Omit<Score, "updatedAt">) => void;
  deleteScoresForEvaluator: (evaluatorId: string) => void;
  deleteScoresForVendor: (vendorId: string) => void;

  // Computed
  getCompletionStatus: () => CompletionStatus[];
  getAggregatedScores: () => AggregatedScore[];

  // RTM bridge — requirement ↔ sub-criterion links
  linkRequirementToCriterion: (subCriterionId: string, requirementId: string) => void;
  unlinkRequirementFromCriterion: (subCriterionId: string, requirementId: string) => void;
  getCriteriaForRequirement: (requirementId: string) => Array<{ criterion: Criterion; subCriterionId: string; subCriterionName: string }>;
  getRequirementsForCriterion: (subCriterionId: string) => string[];
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useLocalStorage<VendorAppData>("rtm-vendor-data", getInitialVendorData());

  // ---- Vendors ------------------------------------------------------------

  const addVendor = useCallback((vendor: Omit<Vendor, "id" | "createdAt">) => {
    setData((prev) => ({
      ...prev,
      vendors: [...prev.vendors, { ...vendor, id: `vendor-${Date.now()}`, createdAt: new Date().toISOString() }],
    }));
  }, [setData]);

  const updateVendor = useCallback((id: string, updates: Partial<Vendor>) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  }, [setData]);

  const deleteVendor = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
      scores: prev.scores.filter((s) => s.vendorId !== id),
    }));
  }, [setData]);

  // ---- Evaluators ---------------------------------------------------------

  const addEvaluator = useCallback((evaluator: Omit<Evaluator, "id" | "createdAt">) => {
    setData((prev) => ({
      ...prev,
      evaluators: [
        ...prev.evaluators,
        { ...evaluator, id: `eval-${Date.now()}`, createdAt: new Date().toISOString() },
      ],
    }));
  }, [setData]);

  const updateEvaluator = useCallback((id: string, updates: Partial<Evaluator>) => {
    setData((prev) => ({
      ...prev,
      evaluators: prev.evaluators.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, [setData]);

  const deleteEvaluator = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      evaluators: prev.evaluators.filter((e) => e.id !== id),
      scores: prev.scores.filter((s) => s.evaluatorId !== id),
    }));
  }, [setData]);

  // ---- Criteria Profiles --------------------------------------------------

  const addCriteriaProfile = useCallback(
    (profile: Omit<CriteriaProfile, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      setData((prev) => ({
        ...prev,
        criteriaProfiles: [
          ...prev.criteriaProfiles,
          { ...profile, id: `criteria-profile-${Date.now()}`, createdAt: now, updatedAt: now },
        ],
      }));
    },
    [setData]
  );

  const updateCriteriaProfile = useCallback(
    (id: string, updates: Partial<Omit<CriteriaProfile, "id" | "createdAt">>) => {
      setData((prev) => ({
        ...prev,
        criteriaProfiles: prev.criteriaProfiles.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
      }));
    },
    [setData]
  );

  const deleteCriteriaProfile = useCallback((id: string) => {
    setData((prev) => {
      const remaining = prev.criteriaProfiles.filter((p) => p.id !== id);
      return {
        ...prev,
        criteriaProfiles: remaining,
        activeCriteriaProfileId:
          prev.activeCriteriaProfileId === id ? (remaining[0]?.id ?? null) : prev.activeCriteriaProfileId,
      };
    });
  }, [setData]);

  const setActiveCriteriaProfile = useCallback((id: string) => {
    setData((prev) => ({ ...prev, activeCriteriaProfileId: id }));
  }, [setData]);

  const importCriteriaProfileFromCSV = useCallback(
    (name: string, csvContent: string, description?: string) => {
      const validation = validateCSV(csvContent);
      if (!validation.success) {
        return { success: false, errors: validation.errors, warnings: validation.warnings };
      }
      const criteria = parseCriteriaFromCSVContent(csvContent);
      const now = new Date().toISOString();
      const profile: CriteriaProfile = {
        id: `criteria-profile-${Date.now()}`,
        name,
        description: description ?? "Imported criteria profile",
        criteria,
        createdAt: now,
        updatedAt: now,
      };
      setData((prev) => ({ ...prev, criteriaProfiles: [...prev.criteriaProfiles, profile] }));
      return { success: true, profileId: profile.id };
    },
    [setData]
  );

  const exportCriteriaProfileToCSV = useCallback(
    (profileId: string): string | null => {
      const profile = data.criteriaProfiles.find((p) => p.id === profileId);
      return profile ? exportCriteriaToCSV(profile.criteria) : null;
    },
    [data.criteriaProfiles]
  );

  const getActiveCriteriaProfile = useCallback((): CriteriaProfile | undefined => {
    return data.criteriaProfiles.find((p) => p.id === data.activeCriteriaProfileId);
  }, [data.criteriaProfiles, data.activeCriteriaProfileId]);

  // ---- Criteria (within active profile) -----------------------------------

  const addCriterion = useCallback((criterion: Omit<Criterion, "id">) => {
    const id = `cat-${Date.now()}`;
    setData((prev) => ({
      ...prev,
      criteriaProfiles: prev.criteriaProfiles.map((p) =>
        p.id === prev.activeCriteriaProfileId
          ? { ...p, criteria: [...p.criteria, { ...criterion, id }] }
          : p
      ),
    }));
  }, [setData]);

  const updateCriterion = useCallback((id: string, updates: Partial<Criterion>) => {
    setData((prev) => ({
      ...prev,
      criteriaProfiles: prev.criteriaProfiles.map((p) =>
        p.id === prev.activeCriteriaProfileId
          ? { ...p, criteria: p.criteria.map((c) => (c.id === id ? { ...c, ...updates } : c)) }
          : p
      ),
    }));
  }, [setData]);

  const deleteCriterion = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      criteriaProfiles: prev.criteriaProfiles.map((p) =>
        p.id === prev.activeCriteriaProfileId
          ? { ...p, criteria: p.criteria.filter((c) => c.id !== id) }
          : p
      ),
      scores: prev.scores.filter((s) => s.criterionId !== id),
    }));
  }, [setData]);

  // ---- Weighting Profiles -------------------------------------------------

  const addWeightingProfile = useCallback(
    (profile: Omit<WeightingProfile, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      setData((prev) => ({
        ...prev,
        weightingProfiles: [
          ...prev.weightingProfiles,
          { ...profile, id: `weighting-profile-${Date.now()}`, createdAt: now, updatedAt: now },
        ],
      }));
    },
    [setData]
  );

  const updateWeightingProfile = useCallback((id: string, updates: Partial<WeightingProfile>) => {
    setData((prev) => ({
      ...prev,
      weightingProfiles: prev.weightingProfiles.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  }, [setData]);

  const deleteWeightingProfile = useCallback((id: string) => {
    setData((prev) => {
      const remaining = prev.weightingProfiles.filter((p) => p.id !== id);
      return {
        ...prev,
        weightingProfiles: remaining,
        activeProfileId:
          prev.activeProfileId === id ? (remaining[0]?.id ?? null) : prev.activeProfileId,
      };
    });
  }, [setData]);

  const setActiveProfile = useCallback((id: string) => {
    setData((prev) => ({ ...prev, activeProfileId: id }));
  }, [setData]);

  const getActiveProfile = useCallback((): WeightingProfile | undefined => {
    return data.weightingProfiles.find((p) => p.id === data.activeProfileId);
  }, [data.weightingProfiles, data.activeProfileId]);

  // ---- Scores -------------------------------------------------------------

  const updateScore = useCallback((score: Omit<Score, "updatedAt">) => {
    setData((prev) => {
      const idx = prev.scores.findIndex(
        (s) =>
          s.evaluatorId === score.evaluatorId &&
          s.vendorId === score.vendorId &&
          s.criterionId === score.criterionId &&
          s.subCriterionId === score.subCriterionId
      );
      const updated: Score = { ...score, updatedAt: new Date().toISOString() };
      if (idx >= 0) {
        const scores = [...prev.scores];
        scores[idx] = updated;
        return { ...prev, scores };
      }
      return { ...prev, scores: [...prev.scores, updated] };
    });
  }, [setData]);

  const deleteScoresForEvaluator = useCallback((evaluatorId: string) => {
    setData((prev) => ({ ...prev, scores: prev.scores.filter((s) => s.evaluatorId !== evaluatorId) }));
  }, [setData]);

  const deleteScoresForVendor = useCallback((vendorId: string) => {
    setData((prev) => ({ ...prev, scores: prev.scores.filter((s) => s.vendorId !== vendorId) }));
  }, [setData]);

  // ---- Computed -----------------------------------------------------------

  const getCompletionStatus = useCallback((): CompletionStatus[] => {
    const profile = data.criteriaProfiles.find((p) => p.id === data.activeCriteriaProfileId);
    if (!profile) return [];

    const total = profile.criteria.reduce((sum, c) => sum + c.subCriteria.length, 0);

    return data.evaluators.flatMap((evaluator) =>
      data.vendors.map((vendor) => {
        const completed = data.scores.filter(
          (s) => s.evaluatorId === evaluator.id && s.vendorId === vendor.id
        ).length;
        return {
          evaluatorId: evaluator.id,
          vendorId: vendor.id,
          completed,
          total,
          percentage: total > 0 ? (completed / total) * 100 : 0,
        };
      })
    );
  }, [data.evaluators, data.vendors, data.criteriaProfiles, data.activeCriteriaProfileId, data.scores]);

  const getAggregatedScores = useCallback((): AggregatedScore[] => {
    const weightingProfile = data.weightingProfiles.find((p) => p.id === data.activeProfileId);
    const criteriaProfile = data.criteriaProfiles.find((p) => p.id === data.activeCriteriaProfileId);
    if (!weightingProfile || !criteriaProfile) return [];

    const scaleMax =
      weightingProfile.scaleConfig.type === "1-5" ? 5 :
      weightingProfile.scaleConfig.type === "1-10" ? 10 :
      weightingProfile.scaleConfig.type === "0-3" ? 3 :
      (weightingProfile.scaleConfig.customOptions?.length ?? 5);

    return data.vendors.map((vendor) => {
      const categoryScores = criteriaProfile.criteria.map((criterion) => {
        let weightedScore = 0;
        let maxScore = 0;

        criterion.subCriteria.forEach((sub) => {
          const weight =
            weightingProfile.weights.find(
              (w) => w.criterionId === criterion.id && w.subCriterionId === sub.id
            )?.weight ?? 0;

          const evaluatorScores = data.evaluators
            .map((ev) =>
              data.scores.find(
                (s) =>
                  s.evaluatorId === ev.id &&
                  s.vendorId === vendor.id &&
                  s.criterionId === criterion.id &&
                  s.subCriterionId === sub.id
              )?.score
            )
            .filter((s): s is number => s !== undefined);

          if (evaluatorScores.length > 0) {
            const avg = evaluatorScores.reduce((a, b) => a + b, 0) / evaluatorScores.length;
            weightedScore += avg * weight;
          }
          maxScore += scaleMax * weight;
        });

        return { category: criterion.category, weightedScore, maxScore };
      });

      const totalWeightedScore = categoryScores.reduce((s, c) => s + c.weightedScore, 0);
      const totalMaxScore = categoryScores.reduce((s, c) => s + c.maxScore, 0);

      return {
        vendorId: vendor.id,
        categoryScores,
        totalWeightedScore,
        totalMaxScore,
        normalizedScore: totalMaxScore > 0 ? (totalWeightedScore / totalMaxScore) * 100 : 0,
      };
    });
  }, [data.vendors, data.criteriaProfiles, data.activeCriteriaProfileId, data.evaluators, data.scores, data.weightingProfiles, data.activeProfileId]);

  // ---- RTM bridge — requirement ↔ sub-criterion links --------------------

  const linkRequirementToCriterion = useCallback(
    (subCriterionId: string, requirementId: string) => {
      setData((prev) => ({
        ...prev,
        criteriaProfiles: prev.criteriaProfiles.map((p) =>
          p.id === prev.activeCriteriaProfileId
            ? {
                ...p,
                criteria: p.criteria.map((c) => ({
                  ...c,
                  subCriteria: c.subCriteria.map((sub) =>
                    sub.id === subCriterionId &&
                    !(sub.linkedRequirementIds ?? []).includes(requirementId)
                      ? {
                          ...sub,
                          linkedRequirementIds: [...(sub.linkedRequirementIds ?? []), requirementId],
                        }
                      : sub
                  ),
                })),
              }
            : p
        ),
      }));
    },
    [setData]
  );

  const unlinkRequirementFromCriterion = useCallback(
    (subCriterionId: string, requirementId: string) => {
      setData((prev) => ({
        ...prev,
        criteriaProfiles: prev.criteriaProfiles.map((p) =>
          p.id === prev.activeCriteriaProfileId
            ? {
                ...p,
                criteria: p.criteria.map((c) => ({
                  ...c,
                  subCriteria: c.subCriteria.map((sub) =>
                    sub.id === subCriterionId
                      ? {
                          ...sub,
                          linkedRequirementIds: (sub.linkedRequirementIds ?? []).filter(
                            (r) => r !== requirementId
                          ),
                        }
                      : sub
                  ),
                })),
              }
            : p
        ),
      }));
    },
    [setData]
  );

  const getCriteriaForRequirement = useCallback(
    (requirementId: string) => {
      // Search only the active profile. Links stored in inactive profiles are
      // preserved in data but not surfaced here — switching profiles intentionally
      // changes which criteria are active. The active profile is the source of truth.
      const profile = data.criteriaProfiles.find((p) => p.id === data.activeCriteriaProfileId);
      if (!profile) return [];

      const results: Array<{ criterion: Criterion; subCriterionId: string; subCriterionName: string }> = [];
      profile.criteria.forEach((c) => {
        c.subCriteria.forEach((sub) => {
          if ((sub.linkedRequirementIds ?? []).includes(requirementId)) {
            results.push({ criterion: c, subCriterionId: sub.id, subCriterionName: sub.name });
          }
        });
      });
      return results;
    },
    [data.criteriaProfiles, data.activeCriteriaProfileId]
  );

  const getRequirementsForCriterion = useCallback(
    (subCriterionId: string): string[] => {
      const profile = data.criteriaProfiles.find((p) => p.id === data.activeCriteriaProfileId);
      if (!profile) return [];

      for (const c of profile.criteria) {
        const sub = c.subCriteria.find((s) => s.id === subCriterionId);
        if (sub) return sub.linkedRequirementIds ?? [];
      }
      return [];
    },
    [data.criteriaProfiles, data.activeCriteriaProfileId]
  );

  // ---- Provider value -----------------------------------------------------

  return (
    <VendorContext.Provider
      value={{
        data,
        addVendor, updateVendor, deleteVendor,
        addEvaluator, updateEvaluator, deleteEvaluator,
        addCriteriaProfile, updateCriteriaProfile, deleteCriteriaProfile,
        setActiveCriteriaProfile, importCriteriaProfileFromCSV,
        exportCriteriaProfileToCSV, getActiveCriteriaProfile,
        addCriterion, updateCriterion, deleteCriterion,
        addWeightingProfile, updateWeightingProfile, deleteWeightingProfile,
        setActiveProfile, getActiveProfile,
        updateScore, deleteScoresForEvaluator, deleteScoresForVendor,
        getCompletionStatus, getAggregatedScores,
        linkRequirementToCriterion, unlinkRequirementFromCriterion,
        getCriteriaForRequirement, getRequirementsForCriterion,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error("useVendor must be used within a VendorProvider");
  return ctx;
}
