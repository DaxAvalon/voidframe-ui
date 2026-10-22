import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import * as icons from "../index";

const PACK = ["BotIcon","BrainIcon","GitBranchIcon","GitMergeIcon","GitCommitIcon","RocketIcon","PackageIcon","ServerIcon","ShieldIcon","TargetIcon","TrophyIcon","FlaskIcon","WandIcon","WrenchIcon","ScissorsIcon","BugIcon","SparklesIcon","ListTodoIcon","ArchiveIcon","CpuIcon","PlugIcon","WorkflowIcon"] as const;

describe("agent / devops icon pack", () => {
  for (const name of PACK) {
    it(`${name} renders a 24×24 monoline svg with a default label`, () => {
      const Comp = (icons as Record<string, React.ComponentType<Record<string, unknown>>>)[name]!;
      const { container } = render(<Comp label={undefined} />);
      const svg = container.querySelector("svg")!;
      expect(svg).not.toBeNull();
      expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
      expect(svg.getAttribute("aria-label")).toBeTruthy();
      expect(svg.querySelectorAll("path, circle, rect").length).toBeGreaterThan(0);
    });
  }
});
