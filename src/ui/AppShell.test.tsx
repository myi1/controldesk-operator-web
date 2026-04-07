import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { AppShell } from "./AppShell";

/* ------------------------------------------------------------------ */
/*  Mock useAuthCheck so the shell renders without a real server        */
/* ------------------------------------------------------------------ */

vi.mock("../hooks/use-auth-check", () => ({
  useAuthCheck: () => ({
    data: { username: "testuser@controldesk.local", roles: ["Operator"], default_actor_role: "Operator" },
    isLoading: false,
    isError: false,
    error: null,
  }),
  AuthServiceUnavailableError: class AuthServiceUnavailableError extends Error {},
}));

/* Mock useBootstrap so the Sidebar doesn't fire real requests */
vi.mock("../hooks/use-bootstrap", () => ({
  useBootstrap: () => ({ data: undefined, isLoading: false, isError: false }),
}));

/* Mock useSessionExpiry — no-op in tests */
vi.mock("../hooks/use-session-expiry", () => ({
  useSessionExpiry: () => undefined,
}));

/* ------------------------------------------------------------------ */
/*  Test wrapper                                                        */
/* ------------------------------------------------------------------ */

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                               */
/* ------------------------------------------------------------------ */

describe("AppShell", () => {
  it("renders the shell with navigation and main content", async () => {
    render(<AppShell />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("complementary", { name: "Navigation" }),
    ).toBeInTheDocument();
  });

  it("renders a skip link for accessibility", async () => {
    render(<AppShell />, { wrapper: createWrapper() });

    const skipLink = await screen.findByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main");
  });
});
