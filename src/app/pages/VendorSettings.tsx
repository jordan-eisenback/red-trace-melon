import { useState, useRef, useCallback } from "react";
import { useVendor } from "../contexts/VendorContext";
import { WeightingProfile, Weight } from "../types/vendor";
import { getDefaultWeights } from "../utils/vendorCsvParser";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Building2,
  ListChecks,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { HelpTooltip } from "../components/HelpTooltip";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// VendorSettings page
// ---------------------------------------------------------------------------

export default function VendorSettings() {
  const {
    data,
    addVendor,
    updateVendor,
    deleteVendor,
    addEvaluator,
    updateEvaluator,
    deleteEvaluator,
    addCriteriaProfile,
    deleteCriteriaProfile,
    setActiveCriteriaProfile,
    importCriteriaProfileFromCSV,
    exportCriteriaProfileToCSV,
    addWeightingProfile,
    updateWeightingProfile,
    deleteWeightingProfile,
    setActiveProfile,
    getActiveCriteriaProfile,
    getActiveProfile,
  } = useVendor();

  // ---- Evaluator dialog state
  const [isEvaluatorDialogOpen, setIsEvaluatorDialogOpen] = useState(false);
  const [editingEvaluatorId, setEditingEvaluatorId] = useState<string | null>(null);

  // ---- Vendor dialog state
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // ---- Criteria profile dialog state
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Weighting profile dialog state
  const [isWeightingDialogOpen, setIsWeightingDialogOpen] = useState(false);
  const [editingWeightingId, setEditingWeightingId] = useState<string | null>(null);
  const [weightingScaleType, setWeightingScaleType] = useState<"1-5" | "1-10" | "0-3" | "custom">("1-5");
  const [weightingScoringMode, setWeightingScoringMode] = useState<"category" | "sub-criteria">("sub-criteria");

  const activeCriteriaProfile = getActiveCriteriaProfile();
  const activeWeightingProfile = getActiveProfile();

  // ---------------------------------------------------------------------------
  // Evaluator handlers
  // ---------------------------------------------------------------------------

  const handleEvaluatorSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;

    if (editingEvaluatorId) {
      updateEvaluator(editingEvaluatorId, { name, email });
      toast.success("Evaluator updated");
    } else {
      addEvaluator({ name, email });
      toast.success("Evaluator added");
    }

    setIsEvaluatorDialogOpen(false);
    setEditingEvaluatorId(null);
  }, [editingEvaluatorId, addEvaluator, updateEvaluator]);

  const openAddEvaluator = useCallback(() => {
    setEditingEvaluatorId(null);
    setIsEvaluatorDialogOpen(true);
  }, []);

  const openEditEvaluator = useCallback((id: string) => {
    setEditingEvaluatorId(id);
    setIsEvaluatorDialogOpen(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Vendor handlers
  // ---------------------------------------------------------------------------

  const handleVendorSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const type = fd.get("type") as "existing" | "replacement";

    if (editingVendorId) {
      updateVendor(editingVendorId, { name, type });
      toast.success("Vendor updated");
    } else {
      addVendor({ name, type });
      toast.success("Vendor added");
    }

    setIsVendorDialogOpen(false);
    setEditingVendorId(null);
  }, [editingVendorId, addVendor, updateVendor]);

  const openAddVendor = useCallback(() => {
    setEditingVendorId(null);
    setIsVendorDialogOpen(true);
  }, []);

  const openEditVendor = useCallback((id: string) => {
    setEditingVendorId(id);
    setIsVendorDialogOpen(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Criteria profile handlers
  // ---------------------------------------------------------------------------

  const handleCreateProfile = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const description = fd.get("description") as string;

    addCriteriaProfile({ name, description, criteria: [] });
    toast.success("Criteria profile created");
    setIsProfileDialogOpen(false);
  }, [addCriteriaProfile]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvContent(ev.target?.result as string);
    reader.readAsText(file);
  }, []);

  const handleImportCSV = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("profile-name") as string;
    const description = fd.get("profile-description") as string;

    if (!csvContent.trim()) {
      toast.error("Please select a CSV file first");
      return;
    }

    const result = importCriteriaProfileFromCSV(name, csvContent, description);

    if (result.success) {
      toast.success("Criteria profile imported");
      setIsImportDialogOpen(false);
      setCsvContent("");
      setImportErrors([]);
      setImportWarnings([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setImportErrors(result.errors ?? []);
      setImportWarnings(result.warnings ?? []);
    }
  }, [csvContent, importCriteriaProfileFromCSV]);

  const handleExportProfile = useCallback((profileId: string) => {
    const csvData = exportCriteriaProfileToCSV(profileId);
    if (!csvData) {
      toast.error("Failed to export profile");
      return;
    }
    const profile = data.criteriaProfiles.find((p) => p.id === profileId);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile?.name ?? "criteria"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Profile exported");
  }, [data.criteriaProfiles, exportCriteriaProfileToCSV]);

  // ---------------------------------------------------------------------------
  // Weighting profile handlers
  // ---------------------------------------------------------------------------

  const openAddWeighting = useCallback(() => {
    setEditingWeightingId(null);
    setWeightingScaleType("1-5");
    setWeightingScoringMode("sub-criteria");
    setIsWeightingDialogOpen(true);
  }, []);

  const openEditWeighting = useCallback((id: string) => {
    const profile = data.weightingProfiles.find((p) => p.id === id);
    if (profile) {
      setWeightingScaleType(profile.scaleConfig.type as "1-5" | "1-10" | "0-3" | "custom");
      setWeightingScoringMode(profile.scoringMode);
    }
    setEditingWeightingId(id);
    setIsWeightingDialogOpen(true);
  }, [data.weightingProfiles]);

  const handleWeightingSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const description = fd.get("description") as string;

    // Build Weight[] from form fields (category-level weights)
    let weights: Weight[] = [];
    if (activeCriteriaProfile) {
      weights = activeCriteriaProfile.criteria.map((criterion) => {
        const rawVal = fd.get(`weight-${criterion.id}`);
        const num = rawVal !== null ? parseFloat(rawVal as string) : NaN;
        return { criterionId: criterion.id, weight: isNaN(num) ? 1 : num };
      });
    } else {
      weights = getDefaultWeights([], weightingScoringMode);
    }

    const profileData: Omit<WeightingProfile, "id" | "createdAt" | "updatedAt"> = {
      name,
      description,
      scaleConfig: { type: weightingScaleType },
      scoringMode: weightingScoringMode,
      weights,
    };

    if (editingWeightingId) {
      updateWeightingProfile(editingWeightingId, profileData);
      toast.success("Weighting profile updated");
    } else {
      addWeightingProfile(profileData);
      toast.success("Weighting profile created");
    }

    setIsWeightingDialogOpen(false);
    setEditingWeightingId(null);
  }, [editingWeightingId, weightingScaleType, weightingScoringMode, activeCriteriaProfile, addWeightingProfile, updateWeightingProfile]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const editingEvaluator = editingEvaluatorId
    ? data.evaluators.find((e) => e.id === editingEvaluatorId)
    : undefined;

  const editingVendor = editingVendorId
    ? data.vendors.find((v) => v.id === editingVendorId)
    : undefined;

  const editingWeighting = editingWeightingId
    ? data.weightingProfiles.find((p) => p.id === editingWeightingId)
    : undefined;

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="size-6 text-gray-600" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Vendor Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage vendors, evaluators, criteria profiles, and weighting configurations
          </p>
        </div>
      </div>

      <Tabs defaultValue="vendors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vendors" className="gap-2">
            <Building2 className="size-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="evaluators" className="gap-2">
            <Users className="size-4" />
            Evaluators
          </TabsTrigger>
          <TabsTrigger value="criteria" className="gap-2">
            <ListChecks className="size-4" />
            Criteria Profiles
          </TabsTrigger>
          <TabsTrigger value="weighting" className="gap-2">
            <Settings className="size-4" />
            Weighting
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------------------------ */}
        {/* VENDORS TAB                                                         */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="vendors" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {data.vendors.length} vendor{data.vendors.length !== 1 ? "s" : ""}
              </span>
              <HelpTooltip content="Vendors are the products or companies being evaluated. Typically includes your current vendor and potential replacements." />
            </div>
            <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddVendor}>
                  <Plus className="size-4 mr-2" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleVendorSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingVendorId ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
                    <DialogDescription>
                      {editingVendorId ? "Update the vendor details." : "Add a vendor to evaluate."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor-name">Name</Label>
                      <Input
                        id="vendor-name"
                        name="name"
                        defaultValue={editingVendor?.name ?? ""}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor-type">Type</Label>
                      <select
                        id="vendor-type"
                        name="type"
                        defaultValue={editingVendor?.type ?? "replacement"}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      >
                        <option value="existing">Current Vendor</option>
                        <option value="replacement">Replacement Option</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingVendorId ? "Update" : "Add"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {data.vendors.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
              <Building2 className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No vendors yet. Add one to get started.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.vendors.map((vendor) => (
                <Card key={vendor.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                        <Badge
                          variant={vendor.type === "existing" ? "default" : "secondary"}
                          className="mt-1"
                        >
                          {vendor.type === "existing" ? "Current" : "Replacement"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditVendor(vendor.id)}
                        title="Edit vendor"
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Delete vendor">
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{vendor.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will also delete all scores recorded for this vendor. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteVendor(vendor.id);
                                toast.success("Vendor deleted");
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* EVALUATORS TAB                                                      */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="evaluators" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {data.evaluators.length} evaluator{data.evaluators.length !== 1 ? "s" : ""}
              </span>
              <HelpTooltip content="Evaluators are the people who score vendors. Each evaluator's scores are tracked independently and averaged in the results." />
            </div>
            <Dialog open={isEvaluatorDialogOpen} onOpenChange={setIsEvaluatorDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddEvaluator}>
                  <Plus className="size-4 mr-2" />
                  Add Evaluator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleEvaluatorSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvaluatorId ? "Edit Evaluator" : "Add Evaluator"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEvaluatorId
                        ? "Update the evaluator's details."
                        : "Add a person who will evaluate vendors."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="eval-name">Name</Label>
                      <Input
                        id="eval-name"
                        name="name"
                        defaultValue={editingEvaluator?.name ?? ""}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eval-email">Email</Label>
                      <Input
                        id="eval-email"
                        name="email"
                        type="email"
                        defaultValue={editingEvaluator?.email ?? ""}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingEvaluatorId ? "Update" : "Add"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {data.evaluators.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
              <Users className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No evaluators yet. Add one to start scoring.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.evaluators.map((evaluator) => (
                <Card key={evaluator.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{evaluator.name}</h3>
                      <p className="text-sm text-gray-500">{evaluator.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditEvaluator(evaluator.id)}
                        title="Edit evaluator"
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Delete evaluator">
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{evaluator.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will also delete all scores recorded by {evaluator.name}. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteEvaluator(evaluator.id);
                                toast.success("Evaluator deleted");
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* CRITERIA PROFILES TAB                                               */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="criteria" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {data.criteriaProfiles.length} profile
                {data.criteriaProfiles.length !== 1 ? "s" : ""}
              </span>
              <HelpTooltip content="Criteria profiles define the categories and sub-criteria vendors are evaluated against. Import from CSV or create manually." />
            </div>
            <div className="flex gap-2">
              {/* Import from CSV */}
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="size-4 mr-2" />
                    Import CSV
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <form onSubmit={handleImportCSV}>
                    <DialogHeader>
                      <div className="flex items-center gap-2">
                        <DialogTitle>Import Criteria from CSV</DialogTitle>
                        <HelpTooltip content="CSV must have columns: Category, Sub-Criterion, Description (optional). Use the export button on an existing profile to see the expected format." />
                      </div>
                      <DialogDescription>
                        Upload a CSV file to create a new criteria profile.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="import-profile-name">Profile Name</Label>
                        <Input id="import-profile-name" name="profile-name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="import-profile-description">
                          Description{" "}
                          <span className="text-gray-400 font-normal">(optional)</span>
                        </Label>
                        <Textarea id="import-profile-description" name="profile-description" rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="csv-file">CSV File</Label>
                        <Input
                          ref={fileInputRef}
                          id="csv-file"
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          required
                        />
                      </div>
                      {csvContent && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          File loaded ({csvContent.split("\n").length - 1} rows)
                        </p>
                      )}
                      {importErrors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="size-4" />
                          <AlertDescription>
                            <p className="font-medium mb-1">Import errors:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-sm">
                              {importErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      {importWarnings.length > 0 && (
                        <Alert>
                          <AlertCircle className="size-4" />
                          <AlertDescription>
                            <p className="font-medium mb-1">Warnings:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-sm">
                              {importWarnings.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="submit">Import</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Create empty profile */}
              <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Create Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateProfile}>
                    <DialogHeader>
                      <DialogTitle>Create Criteria Profile</DialogTitle>
                      <DialogDescription>
                        Create a new empty criteria profile to populate manually.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-profile-name">Name</Label>
                        <Input id="new-profile-name" name="name" required autoFocus />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-profile-description">Description</Label>
                        <Textarea id="new-profile-description" name="description" rows={2} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {data.criteriaProfiles.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
              <ListChecks className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No criteria profiles yet. Import a CSV or create one manually.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.criteriaProfiles.map((profile) => {
                const isActive = profile.id === data.activeCriteriaProfileId;
                const subCriteriaCount = profile.criteria.reduce(
                  (sum, c) => sum + c.subCriteria.length,
                  0
                );

                return (
                  <Card
                    key={profile.id}
                    className={isActive ? "border-indigo-500 border-2 shadow-sm" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-900">{profile.name}</h3>
                            {isActive && (
                              <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">
                                <CheckCircle2 className="size-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          {profile.description && (
                            <p className="text-sm text-gray-500 truncate">{profile.description}</p>
                          )}
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <Badge variant="outline">
                              {profile.criteria.length} categor{profile.criteria.length !== 1 ? "ies" : "y"}
                            </Badge>
                            <Badge variant="outline">
                              {subCriteriaCount} sub-criteri{subCriteriaCount !== 1 ? "a" : "on"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveCriteriaProfile(profile.id);
                                toast.success("Criteria profile activated");
                              }}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportProfile(profile.id)}
                            title="Export profile as CSV"
                          >
                            <Download className="size-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isActive}
                                title={isActive ? "Cannot delete the active profile" : "Delete profile"}
                              >
                                <Trash2 className="size-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{profile.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the criteria profile. This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    deleteCriteriaProfile(profile.id);
                                    toast.success("Profile deleted");
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* WEIGHTING PROFILES TAB                                              */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="weighting" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {data.weightingProfiles.length} weighting profile
                {data.weightingProfiles.length !== 1 ? "s" : ""}
              </span>
              <HelpTooltip content="Weighting profiles set how much each criterion category counts toward the final score. They also configure the scoring scale (1–5, 1–10, etc.)." />
            </div>
            <Dialog open={isWeightingDialogOpen} onOpenChange={setIsWeightingDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddWeighting}>
                  <Plus className="size-4 mr-2" />
                  Add Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleWeightingSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingWeightingId ? "Edit Weighting Profile" : "Create Weighting Profile"}
                    </DialogTitle>
                    <DialogDescription>
                      Configure the scoring scale, mode, and per-category weights.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="wp-name">Name</Label>
                      <Input
                        id="wp-name"
                        name="name"
                        defaultValue={editingWeighting?.name ?? ""}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wp-description">Description</Label>
                      <Textarea
                        id="wp-description"
                        name="description"
                        defaultValue={editingWeighting?.description ?? ""}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Scoring Scale</Label>
                        <Select
                          value={weightingScaleType}
                          onValueChange={(v) =>
                            setWeightingScaleType(v as "1-5" | "1-10" | "0-3" | "custom")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-5">1 – 5</SelectItem>
                            <SelectItem value="1-10">1 – 10</SelectItem>
                            <SelectItem value="0-3">0 – 3</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Scoring Mode</Label>
                        <Select
                          value={weightingScoringMode}
                          onValueChange={(v) =>
                            setWeightingScoringMode(v as "category" | "sub-criteria")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sub-criteria">Sub-criteria</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Per-category weight inputs */}
                    {activeCriteriaProfile && activeCriteriaProfile.criteria.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Category Weights</Label>
                        <p className="text-xs text-gray-500">
                          Enter relative weights for each category. Higher values = more
                          influence on the final score.
                        </p>
                        <div className="space-y-2 mt-1">
                          {activeCriteriaProfile.criteria.map((criterion) => {
                            const existingWeight = editingWeighting?.weights?.find(
                              (w) => w.criterionId === criterion.id && !w.subCriterionId
                            )?.weight;
                            return (
                              <div key={criterion.id} className="flex items-center gap-3">
                                <span className="text-sm text-gray-700 flex-1 truncate">
                                  {criterion.category}
                                </span>
                                <Input
                                  type="number"
                                  name={`weight-${criterion.id}`}
                                  defaultValue={existingWeight ?? 1}
                                  min={0}
                                  step={0.1}
                                  className="w-20 text-right"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {!activeCriteriaProfile && (
                      <Alert>
                        <AlertCircle className="size-4" />
                        <AlertDescription className="text-sm">
                          Activate a criteria profile first to configure per-category weights.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingWeightingId ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {data.weightingProfiles.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
              <Settings className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No weighting profiles yet.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.weightingProfiles.map((profile) => {
                const isActive = profile.id === data.activeProfileId;
                const criterionCount = Object.keys(profile.weights ?? {}).length;

                return (
                  <Card
                    key={profile.id}
                    className={isActive ? "border-indigo-500 border-2 shadow-sm" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-900">{profile.name}</h3>
                            {isActive && (
                              <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">
                                <CheckCircle2 className="size-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          {profile.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {profile.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <Badge variant="outline">
                              Scale: {profile.scaleConfig.type}
                            </Badge>
                            <Badge variant="outline">
                              Mode: {profile.scoringMode === "sub-criteria" ? "Sub-criteria" : "Category"}
                            </Badge>
                            {criterionCount > 0 && (
                              <Badge variant="outline">
                                {criterionCount} weight{criterionCount !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveProfile(profile.id);
                                toast.success("Weighting profile activated");
                              }}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditWeighting(profile.id)}
                            title="Edit profile"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isActive}
                                title={isActive ? "Cannot delete the active profile" : "Delete profile"}
                              >
                                <Trash2 className="size-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{profile.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the weighting profile. This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    deleteWeightingProfile(profile.id);
                                    toast.success("Profile deleted");
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
