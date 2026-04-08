/**
 * src/__tests__/test-utils.tsx
 *
 * Shared test utilities for context tests.
 *
 * All data contexts (RequirementsContext, EpicContext, FrameworkContext,
 * VendorContext, AdminContext) now depend on ProjectContext via useProject().
 * This module provides a composite AllProviders wrapper that satisfies that
 * dependency so individual context tests don't have to know about the full
 * provider tree.
 */
import React from "react";
import { ProjectProvider } from "../app/contexts/ProjectContext";

/**
 * Wrap children in the minimum provider tree required for any context test.
 * ProjectProvider must be outermost because every other context reads
 * `activeProjectId` from it to namespace their localStorage keys.
 */
export const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ProjectProvider>{children}</ProjectProvider>
);

/**
 * Convenience: wrap a single provider inside AllProviders.
 * Usage:
 *   const wrapper = withProviders(({ children }) => <MyProvider>{children}</MyProvider>);
 */
export function withProviders(
  Inner: React.ComponentType<{ children: React.ReactNode }>,
): React.ComponentType<{ children: React.ReactNode }> {
  return function Wrapper({ children }) {
    return (
      <AllProviders>
        <Inner>{children}</Inner>
      </AllProviders>
    );
  };
}
