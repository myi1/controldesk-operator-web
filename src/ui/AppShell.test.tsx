import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./AppShell";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe("AppShell", () => {
  it("renders the shell with navigation and main content", () => {
    render(<AppShell />, { wrapper: createWrapper() });

    expect(screen.getByText("ControlDesk")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Navigation" }),
    ).toBeInTheDocument();
  });

  it("renders a skip link for accessibility", () => {
    render(<AppShell />, { wrapper: createWrapper() });

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main");
  });
});
