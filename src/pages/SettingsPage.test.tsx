import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import SettingsPage from "./SettingsPage";

/* ------------------------------------------------------------------ */
/*  Module mocks                                                        */
/* ------------------------------------------------------------------ */

vi.mock("../hooks/use-theme", () => ({
  useTheme: () => ({ theme: "system", setTheme: vi.fn(), resolvedTheme: "light" }),
}));

vi.mock("../stores/ui-store", () => ({
  useUIStore: () => ({
    rowDensity: "comfortable",
    setRowDensity: vi.fn(),
    sidebarCollapsed: false,
    toggleSidebar: vi.fn(),
  }),
}));

vi.mock("../hooks/use-role-gate", () => ({
  useRoleGate: () => ({ userRoles: ["Operator", "Manager"] }),
}));

vi.mock("../hooks/use-auth-check", () => ({
  useAuthCheck: () => ({ data: { username: "operator@controldesk.local", roles: ["Operator"], default_actor_role: "Operator" } }),
  AuthServiceUnavailableError: class AuthServiceUnavailableError extends Error {},
}));

vi.mock("../lib/auth", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
  clearToken: vi.fn(),
}));

/* ------------------------------------------------------------------ */
/*  Test wrapper                                                        */
/* ------------------------------------------------------------------ */

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Tests                                                               */
/* ------------------------------------------------------------------ */

describe("SettingsPage", () => {
  it("renders the Appearance, Keyboard Shortcuts, and Account sections", () => {
    render(<SettingsPage />, { wrapper: Wrapper });

    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("shows the current user email in the Account section", () => {
    render(<SettingsPage />, { wrapper: Wrapper });

    expect(screen.getByText("operator@controldesk.local")).toBeInTheDocument();
  });

  it("renders all three theme options in a radiogroup", () => {
    render(<SettingsPage />, { wrapper: Wrapper });

    const radiogroup = screen.getByRole("radiogroup", { name: "Theme" });
    expect(radiogroup).toBeInTheDocument();

    expect(screen.getByRole("radio", { name: /System/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Light/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Dark/i })).toBeInTheDocument();
  });

  it("marks the current theme option as checked", () => {
    render(<SettingsPage />, { wrapper: Wrapper });

    expect(screen.getByRole("radio", { name: /System/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: /Light/i })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("displays user roles as badges", () => {
    render(<SettingsPage />, { wrapper: Wrapper });

    expect(screen.getByText("Operator")).toBeInTheDocument();
    expect(screen.getByText("Manager")).toBeInTheDocument();
  });

  it("renders the keyboard shortcuts table with proper column headers", () => {
    render(<SettingsPage />, { wrapper: Wrapper });

    const ths = screen
      .getAllByRole("columnheader")
      .filter((th) => th.getAttribute("scope") === "col");
    expect(ths).toHaveLength(3);
    expect(ths[0]).toHaveTextContent("Key");
    expect(ths[1]).toHaveTextContent("Description");
    expect(ths[2]).toHaveTextContent("Scope");
  });

  it("renders a Sign out button", () => {
    render(<SettingsPage />, { wrapper: Wrapper });

    expect(screen.getByRole("button", { name: /Sign out/i })).toBeInTheDocument();
  });

  it("disables the Sign out button while signing out", () => {
    render(<SettingsPage />, { wrapper: Wrapper });

    const btn = screen.getByRole("button", { name: /Sign out/i });
    fireEvent.click(btn);

    // After click the button becomes disabled while the async sign-out runs
    expect(btn).toBeDisabled();
  });
});
