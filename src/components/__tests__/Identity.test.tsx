import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { UserCard, TeamCard, OrganizationCard, PresenceList } from "../Identity";

describe("UserCard", () => {
  it("renders user name", () => {
    renderWithTheme(<UserCard user={{ name: "Alice" }} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders email, title, role, team", () => {
    renderWithTheme(
      <UserCard
        user={{
          name: "Alice",
          email: "alice@example.com",
          title: "Engineer",
          role: "Admin",
          team: "Platform",
        }}
      />
    );
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
  });

  it("renders status dot when status provided", () => {
    const { container } = renderWithTheme(
      <UserCard user={{ name: "Alice", status: "online" }} />
    );
    expect(container.querySelector(".vf-user-card__status-dot--online")).toBeInTheDocument();
  });

  it("renders as article by default", () => {
    renderWithTheme(<UserCard user={{ name: "Alice" }} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("renders as button when onSelect given", async () => {
    const onSelect = vi.fn();
    renderWithTheme(<UserCard user={{ name: "Alice" }} onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    await userEvent.click(btn);
    expect(onSelect).toHaveBeenCalled();
  });

  it("applies compact class", () => {
    const { container } = renderWithTheme(
      <UserCard user={{ name: "Alice" }} compact />
    );
    expect(container.querySelector(".vf-user-card--compact")).toBeInTheDocument();
  });

  it("renders actions slot", () => {
    renderWithTheme(
      <UserCard user={{ name: "Alice" }} actions={<button>Edit</button>} />
    );
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});

describe("TeamCard", () => {
  it("renders team name and description", () => {
    renderWithTheme(
      <TeamCard team={{ name: "Engineering", description: "Build things" }} />
    );
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Build things")).toBeInTheDocument();
  });

  it("renders member count", () => {
    renderWithTheme(
      <TeamCard team={{ name: "Design", memberCount: 8 }} />
    );
    expect(screen.getByText(/8/)).toBeInTheDocument();
  });

  it("renders as button when onSelect given", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <TeamCard team={{ name: "Design" }} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe("OrganizationCard", () => {
  it("renders org name", () => {
    renderWithTheme(<OrganizationCard organization={{ name: "Acme Corp" }} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders description and website", () => {
    renderWithTheme(
      <OrganizationCard
        organization={{ name: "Acme", description: "A company", website: "https://acme.com" }}
      />
    );
    expect(screen.getByText("A company")).toBeInTheDocument();
    expect(screen.getByText("acme.com")).toBeInTheDocument();
  });

  it("renders member count", () => {
    renderWithTheme(
      <OrganizationCard organization={{ name: "Acme", members: 42 }} />
    );
    expect(screen.getByText("42 members")).toBeInTheDocument();
  });

  it("renders as button when onSelect given", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <OrganizationCard organization={{ name: "Acme" }} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders actions slot", () => {
    renderWithTheme(
      <OrganizationCard
        organization={{ name: "Acme" }}
        actions={<button>Edit Org</button>}
      />
    );
    expect(screen.getByText("Edit Org")).toBeInTheDocument();
  });
});

describe("PresenceList", () => {
  it("renders users with status messages", () => {
    renderWithTheme(
      <PresenceList
        users={[
          { id: "1", name: "Alice", status: "online", statusMessage: "Working" },
          { id: "2", name: "Bob", status: "away" },
        ]}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Working")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
