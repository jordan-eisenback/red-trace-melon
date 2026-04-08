/**
 * Component tests for RequirementFormDialog and RequirementMappingModal (closes #43)
 *
 * Strategy:
 *  - Render each component inside a composite AllProviders wrapper that supplies
 *    both RequirementsContext and FrameworkContext.
 *  - localStorage is cleared before each test so we start from deterministic state.
 *  - fetch is stubbed to silence usePersistToDisk network calls.
 *  - sonner (toast) is mocked to prevent "Could not find a portal target" errors in jsdom.
 *  - @radix-ui/react-dialog needs a real DOM so we use the default jsdom environment
 *    that Vitest already configures via setupFiles.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RequirementsProvider } from '../app/contexts/RequirementsContext';
import { FrameworkProvider } from '../app/contexts/FrameworkContext';
import { RequirementFormDialog } from '../app/components/RequirementFormDialog';
import { RequirementMappingModal } from '../app/components/RequirementMappingModal';
import type { Requirement } from '../app/types/requirement';
import type { Framework } from '../app/types/framework';
import { AllProviders as ProjectAllProviders } from './test-utils';

// ── mocks ──────────────────────────────────────────────────────────────────

// Prevent sonner from trying to attach a portal in jsdom (no Toaster mounted)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// ── providers ─────────────────────────────────────────────────────────────

/**
 * Composite wrapper: both contexts share the same localStorage-cleared state,
 * so they start empty (no seed data) and are fully independent across tests.
 */
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ProjectAllProviders>
    <RequirementsProvider>
      <FrameworkProvider>{children}</FrameworkProvider>
    </RequirementsProvider>
  </ProjectAllProviders>
);

// ── helpers ───────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: 'REQ-001',
    req: 'The system shall enforce role-based access',
    type: 'Enterprise',
    owner: 'Security Team',
    parent: null,
    outcome: 'Users can only access permitted resources',
    notes: 'Baseline security requirement',
    ...overrides,
  };
}

/**
 * Build a minimal Framework with one control pre-populated in localStorage so
 * FrameworkProvider sees it immediately on mount.
 */
function seedFramework() {
  const fw: Framework = {
    id: 'fw-1',
    name: 'NIST SP 800-53',
    version: 'Rev 5',
    description: 'Security and Privacy Controls',
    category: 'Compliance',
    isActive: true,
    controls: [
      {
        id: 'ctrl-1',
        frameworkId: 'fw-1',
        controlId: 'AC-1',
        title: 'Policy and Procedures',
        description: 'Access control policy and procedures',
        requirements: [],
      },
    ],
  };
  localStorage.setItem('rtm-frameworks', JSON.stringify([fw]));
}

/**
 * Seed a single requirement into localStorage so RequirementsProvider sees it.
 */
function seedRequirement(req: Requirement) {
  localStorage.setItem('rtm-requirements', JSON.stringify([req]));
}

// ── setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

// ═════════════════════════════════════════════════════════════════════════════
// RequirementFormDialog
// ═════════════════════════════════════════════════════════════════════════════

describe('RequirementFormDialog', () => {
  // ── render state ──────────────────────────────────────────────────────────

  it('renders nothing when open=false', () => {
    const { container } = render(
      <AllProviders>
        <RequirementFormDialog open={false} onClose={vi.fn()} />
      </AllProviders>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders "Add Requirement" heading in new-requirement mode', () => {
    render(
      <AllProviders>
        <RequirementFormDialog open={true} onClose={vi.fn()} />
      </AllProviders>,
    );
    expect(screen.getByText('Add Requirement')).toBeInTheDocument();
  });

  it('renders "Edit Requirement" heading when a requirement is provided', () => {
    render(
      <AllProviders>
        <RequirementFormDialog
          open={true}
          onClose={vi.fn()}
          requirement={makeReq()}
        />
      </AllProviders>,
    );
    expect(screen.getByText('Edit Requirement')).toBeInTheDocument();
  });

  it('pre-populates form fields in edit mode', () => {
    const req = makeReq({ id: 'REQ-042', req: 'Pre-populated requirement text' });
    render(
      <AllProviders>
        <RequirementFormDialog open={true} onClose={vi.fn()} requirement={req} />
      </AllProviders>,
    );

    expect((screen.getByDisplayValue('REQ-042') as HTMLInputElement).value).toBe('REQ-042');
    expect(screen.getByDisplayValue('Pre-populated requirement text')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Security Team')).toBeInTheDocument();
  });

  it('shows empty inputs in new-requirement mode', () => {
    render(
      <AllProviders>
        <RequirementFormDialog open={true} onClose={vi.fn()} />
      </AllProviders>,
    );
    const idInput = screen.getByPlaceholderText('e.g., RBAC-REQ-1.1') as HTMLInputElement;
    expect(idInput.value).toBe('');
  });

  // ── submit ────────────────────────────────────────────────────────────────

  it('calls onClose after valid submit (create path)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AllProviders>
        <RequirementFormDialog open={true} onClose={onClose} />
      </AllProviders>,
    );

    await user.type(screen.getByPlaceholderText('e.g., RBAC-REQ-1.1'), 'NEW-001');
    await user.type(screen.getByPlaceholderText('Enter the requirement description'), 'New test requirement');
    await user.type(screen.getByPlaceholderText('e.g., Enterprise, Capability'), 'Enterprise');
    await user.type(screen.getByPlaceholderText('e.g., RBAC Product'), 'Test Owner');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after valid submit in edit mode (update path)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const req = makeReq();

    render(
      <AllProviders>
        <RequirementFormDialog open={true} onClose={onClose} requirement={req} />
      </AllProviders>,
    );

    // Clear and retype the req field to ensure the form is dirty
    const textarea = screen.getByDisplayValue('The system shall enforce role-based access');
    await user.clear(textarea);
    await user.type(textarea, 'Updated requirement text');

    await user.click(screen.getByRole('button', { name: 'Update' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked without saving', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AllProviders>
        <RequirementFormDialog open={true} onClose={onClose} />
      </AllProviders>,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the X close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AllProviders>
        <RequirementFormDialog open={true} onClose={onClose} />
      </AllProviders>,
    );

    // The X button has no accessible name — find it by its SVG aria context
    // (it's the only button without text adjacent to the heading row)
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find(
      (b) => !b.textContent?.trim() || b.textContent.trim() === '',
    );
    expect(closeBtn).toBeDefined();
    await user.click(closeBtn!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when required fields are missing (browser validation blocks submit)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AllProviders>
        <RequirementFormDialog open={true} onClose={onClose} />
      </AllProviders>,
    );

    // Click submit without filling required fields
    await user.click(screen.getByRole('button', { name: 'Create' }));

    // onClose is only called from handleSubmit which only runs if the browser
    // allows the form to submit (required fields satisfied). With empty
    // required inputs, browser validation prevents submission.
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RequirementMappingModal
// ═════════════════════════════════════════════════════════════════════════════

describe('RequirementMappingModal', () => {
  // ── render state ──────────────────────────────────────────────────────────

  it('renders nothing when frameworkId/controlId do not match any seeded data', () => {
    // No seed data — frameworks list is empty, so currentControl is undefined → returns null
    const { container } = render(
      <AllProviders>
        <RequirementMappingModal
          open={true}
          onClose={vi.fn()}
          frameworkId="fw-missing"
          controlId="ctrl-missing"
        />
      </AllProviders>,
    );
    // Component returns null when control not found
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('displays the control title and framework name in the modal header', async () => {
    seedFramework();

    render(
      <AllProviders>
        <RequirementMappingModal
          open={true}
          onClose={vi.fn()}
          frameworkId="fw-1"
          controlId="ctrl-1"
        />
      </AllProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('Map Requirements to Control')).toBeInTheDocument();
    });
    expect(screen.getByText('NIST SP 800-53')).toBeInTheDocument();
    expect(screen.getByText('AC-1')).toBeInTheDocument();
  });

  it('displays available requirements as selectable rows', async () => {
    seedFramework();
    seedRequirement(makeReq({ id: 'REQ-001', req: 'The system shall enforce role-based access' }));

    render(
      <AllProviders>
        <RequirementMappingModal
          open={true}
          onClose={vi.fn()}
          frameworkId="fw-1"
          controlId="ctrl-1"
        />
      </AllProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('REQ-001')).toBeInTheDocument();
    });
    expect(screen.getByText('The system shall enforce role-based access')).toBeInTheDocument();
  });

  it('toggles a requirement mapping on when clicked', async () => {
    seedFramework();
    seedRequirement(makeReq({ id: 'REQ-001' }));

    const user = userEvent.setup();

    render(
      <AllProviders>
        <RequirementMappingModal
          open={true}
          onClose={vi.fn()}
          frameworkId="fw-1"
          controlId="ctrl-1"
        />
      </AllProviders>,
    );

    // Wait for the requirement row to appear then click it
    const reqRow = await screen.findByText('REQ-001');
    await user.click(reqRow.closest('button')!);

    // After mapping, the footer counter should show "1 of 1 selected"
    await waitFor(() => {
      expect(screen.getByText(/1 of 1 selected/i)).toBeInTheDocument();
    });
  });

  it('shows a search input and filters requirements by search term', async () => {
    seedFramework();
    seedRequirement(makeReq({ id: 'REQ-001', req: 'Role-based access control' }));

    const user = userEvent.setup();

    render(
      <AllProviders>
        <RequirementMappingModal
          open={true}
          onClose={vi.fn()}
          frameworkId="fw-1"
          controlId="ctrl-1"
        />
      </AllProviders>,
    );

    const searchInput = await screen.findByPlaceholderText('Search requirements...');
    expect(searchInput).toBeInTheDocument();

    // Type a term that won't match anything
    await user.type(searchInput, 'xyzzy-no-match');

    await waitFor(() => {
      expect(screen.getByText('No requirements found')).toBeInTheDocument();
    });
  });

  it('calls onClose when Done button is clicked', async () => {
    seedFramework();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AllProviders>
        <RequirementMappingModal
          open={true}
          onClose={onClose}
          frameworkId="fw-1"
          controlId="ctrl-1"
        />
      </AllProviders>,
    );

    await user.click(await screen.findByRole('button', { name: 'Done' }, { timeout: 10_000 }));

    expect(onClose).toHaveBeenCalledTimes(1);
  }, 15_000);

  it('removes a mapping when a mapped requirement is clicked again', async () => {
    seedFramework();
    // Seed requirement and pre-map it via the control's requirements list
    const req = makeReq({ id: 'REQ-001' });
    seedRequirement(req);

    // Override the seeded framework so REQ-001 is already mapped to ctrl-1
    const fw: Framework = {
      id: 'fw-1',
      name: 'NIST SP 800-53',
      version: 'Rev 5',
      description: 'Security and Privacy Controls',
      category: 'Compliance',
      isActive: true,
      controls: [
        {
          id: 'ctrl-1',
          frameworkId: 'fw-1',
          controlId: 'AC-1',
          title: 'Policy and Procedures',
          description: 'Access control policy',
          requirements: ['REQ-001'],   // pre-mapped
        },
      ],
    };
    localStorage.setItem('rtm-frameworks', JSON.stringify([fw]));

    const user = userEvent.setup();

    render(
      <AllProviders>
        <RequirementMappingModal
          open={true}
          onClose={vi.fn()}
          frameworkId="fw-1"
          controlId="ctrl-1"
        />
      </AllProviders>,
    );

    // Initially shows 1 mapped
    await waitFor(() => {
      expect(screen.getByText(/1 of 1 selected/i)).toBeInTheDocument();
    });

    // Click the mapped requirement to unmap it
    const reqRow = await screen.findByText('REQ-001');
    await user.click(reqRow.closest('button')!);

    // Should now show 0 selected
    await waitFor(() => {
      expect(screen.getByText(/0 of 1 selected/i)).toBeInTheDocument();
    });
  });
});
