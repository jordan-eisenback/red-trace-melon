import ExcelJS from "exceljs";
import { Requirement } from "../types/requirement";
import { Framework } from "../types/framework";
import { Epic, UserStory } from "../types/epic";

interface ExportData {
  requirements: Requirement[];
  frameworks: Framework[];
  epics: Epic[];
  userStories: UserStory[];
}

export async function exportToExcel(data: ExportData): Promise<string> {
  const { requirements, frameworks, epics, userStories } = data;

  const workbook = new ExcelJS.Workbook();

  // Helper to add a sheet with columns and rows
  const addSheet = (name: string, columns: { header: string; key: string; width?: number }[], rows: any[]) => {
    const sheet = workbook.addWorksheet(name);
    sheet.columns = columns;
    if (rows && rows.length) sheet.addRows(rows);
    return sheet;
  };

  // 1. Requirements
  const requirementsRows = requirements.map((req) => ({
    ID: req.id,
    Type: req.type,
    Description: req.req,
    Owner: req.owner,
    Parent: req.parent || "",
    Outcome: req.outcome,
    Notes: req.notes || "",
  }));

  addSheet(
    "Requirements",
    [
      { header: "ID", key: "ID", width: 15 },
      { header: "Type", key: "Type", width: 20 },
      { header: "Description", key: "Description", width: 60 },
      { header: "Owner", key: "Owner", width: 20 },
      { header: "Parent", key: "Parent", width: 15 },
      { header: "Outcome", key: "Outcome", width: 40 },
      { header: "Notes", key: "Notes", width: 40 },
    ],
    requirementsRows
  );

  // 2. Dependencies
  const dependenciesRows: Array<any> = [];
  requirements.forEach((req) => {
    if (req.parent) {
      const parent = requirements.find((r) => r.id === req.parent);
      dependenciesRows.push({
        "Requirement ID": req.id,
        "Parent ID": req.parent,
        "Requirement Description": req.req,
        "Parent Description": parent?.req || "Not Found",
      });
    }
  });

  addSheet(
    "Dependencies",
    [
      { header: "Requirement ID", key: "Requirement ID", width: 15 },
      { header: "Parent ID", key: "Parent ID", width: 15 },
      { header: "Requirement Description", key: "Requirement Description", width: 50 },
      { header: "Parent Description", key: "Parent Description", width: 50 },
    ],
    dependenciesRows
  );

  // 3. Framework Mappings
  const mappingsRows: Array<any> = [];
  frameworks.forEach((framework) => {
    framework.controls.forEach((control) => {
      control.requirements.forEach((reqId) => {
        const req = requirements.find((r) => r.id === reqId);
        if (req) {
          mappingsRows.push({
            "Requirement ID": reqId,
            "Requirement Description": req.req,
            Framework: framework.name,
            "Control ID": control.id,
            "Control Description": control.description,
          });
        }
      });
    });
  });

  addSheet(
    "Framework Mappings",
    [
      { header: "Requirement ID", key: "Requirement ID", width: 15 },
      { header: "Requirement Description", key: "Requirement Description", width: 50 },
      { header: "Framework", key: "Framework", width: 15 },
      { header: "Control ID", key: "Control ID", width: 15 },
      { header: "Control Description", key: "Control Description", width: 50 },
    ],
    mappingsRows
  );

  // 4. Controls
  const controlsRows: Array<any> = [];
  frameworks.forEach((framework) => {
    framework.controls.forEach((control) => {
      controlsRows.push({
        Framework: framework.name,
        "Control ID": control.id,
        "Control Description": control.description,
        "Mapped Requirements": control.requirements.join(", "),
      });
    });
  });

  addSheet(
    "Controls",
    [
      { header: "Framework", key: "Framework", width: 15 },
      { header: "Control ID", key: "Control ID", width: 15 },
      { header: "Control Description", key: "Control Description", width: 50 },
      { header: "Mapped Requirements", key: "Mapped Requirements", width: 40 },
    ],
    controlsRows
  );

  // 5. Epics
  const epicsRows = epics.map((epic) => ({
    ID: epic.id,
    Title: epic.title,
    Description: epic.description,
    Status: epic.status,
    Priority: epic.priority,
    Owner: epic.owner,
    Notes: epic.notes || "",
    "Mapped Requirements": epic.requirements.join(", "),
  }));

  addSheet(
    "Epics",
    [
      { header: "ID", key: "ID", width: 10 },
      { header: "Title", key: "Title", width: 30 },
      { header: "Description", key: "Description", width: 50 },
      { header: "Status", key: "Status", width: 15 },
      { header: "Priority", key: "Priority", width: 10 },
      { header: "Owner", key: "Owner", width: 20 },
      { header: "Notes", key: "Notes", width: 30 },
      { header: "Mapped Requirements", key: "Mapped Requirements", width: 30 },
    ],
    epicsRows
  );

  // 6. User Stories
  const storiesRows = userStories.map((story) => {
    const epic = epics.find((e) => e.id === story.epicId);
    return {
      ID: story.id,
      "Epic ID": story.epicId,
      "Epic Title": epic?.title || "",
      Title: story.title,
      Description: story.description,
      "Acceptance Criteria": (story.acceptanceCriteria || []).join("; "),
      Status: story.status,
      Priority: story.priority,
      "Story Points": story.storyPoints || "",
      Assignee: story.assignee || "",
      Notes: story.notes || "",
      "Mapped Requirements": story.requirements.join(", "),
    };
  });

  addSheet(
    "User Stories",
    [
      { header: "ID", key: "ID", width: 10 },
      { header: "Epic ID", key: "Epic ID", width: 10 },
      { header: "Epic Title", key: "Epic Title", width: 25 },
      { header: "Title", key: "Title", width: 30 },
      { header: "Description", key: "Description", width: 50 },
      { header: "Acceptance Criteria", key: "Acceptance Criteria", width: 50 },
      { header: "Status", key: "Status", width: 15 },
      { header: "Priority", key: "Priority", width: 10 },
      { header: "Story Points", key: "Story Points", width: 12 },
      { header: "Assignee", key: "Assignee", width: 20 },
      { header: "Notes", key: "Notes", width: 30 },
      { header: "Mapped Requirements", key: "Mapped Requirements", width: 30 },
    ],
    storiesRows
  );

  // 7. Summary
  const reqByType = requirements.reduce((acc, req) => {
    acc[req.type] = (acc[req.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reqByOwner = requirements.reduce((acc, req) => {
    acc[req.owner] = (acc[req.owner] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summaryRows: Array<any> = [
    { Metric: "Total Requirements", Value: requirements.length },
    { Metric: "Total Frameworks", Value: frameworks.length },
    { Metric: "Total Controls", Value: frameworks.reduce((sum, f) => sum + f.controls.length, 0) },
    { Metric: "Total Framework Mappings", Value: mappingsRows.length },
    { Metric: "Total Epics", Value: epics.length },
    { Metric: "Total User Stories", Value: userStories.length },
    { Metric: "", Value: "" },
    { Metric: "Requirements by Type", Value: "" },
    ...Object.entries(reqByType).map(([type, count]) => ({ Metric: `  ${type}`, Value: count })),
    { Metric: "", Value: "" },
    { Metric: "Requirements by Owner", Value: "" },
    ...Object.entries(reqByOwner).map(([owner, count]) => ({ Metric: `  ${owner}`, Value: count })),
  ];

  addSheet(
    "Summary",
    [
      { header: "Metric", key: "Metric", width: 40 },
      { header: "Value", key: "Value", width: 15 },
    ],
    summaryRows
  );

  // 8. Traceability Matrix
  const traceRows: Array<any> = [];
  requirements.forEach((req) => {
    const reqMappings: string[] = [];
    frameworks.forEach((framework) => {
      framework.controls.forEach((control) => {
        if (control.requirements.includes(req.id)) reqMappings.push(`${framework.name}: ${control.id}`);
      });
    });

    const reqEpics = epics.filter((e) => e.requirements.includes(req.id)).map((e) => e.title);
    const reqStories = userStories.filter((s) => s.requirements.includes(req.id)).map((s) => s.title);

    traceRows.push({
      "Requirement ID": req.id,
      "Requirement Description": req.req,
      Type: req.type,
      Owner: req.owner,
      "Framework Mappings": reqMappings.join("; "),
      Epics: reqEpics.join("; "),
      "User Stories": reqStories.join("; "),
    });
  });

  addSheet(
    "Traceability Matrix",
    [
      { header: "Requirement ID", key: "Requirement ID", width: 15 },
      { header: "Requirement Description", key: "Requirement Description", width: 60 },
      { header: "Type", key: "Type", width: 20 },
      { header: "Owner", key: "Owner", width: 20 },
      { header: "Framework Mappings", key: "Framework Mappings", width: 40 },
      { header: "Epics", key: "Epics", width: 30 },
      { header: "User Stories", key: "User Stories", width: 30 },
    ],
    traceRows
  );

  // Write file
  const timestamp = new Date().toISOString().split("T")[0];
  const fileName = `RTM_Export_${timestamp}.xlsx`;
  await workbook.xlsx.writeFile(fileName);
  return fileName;
}