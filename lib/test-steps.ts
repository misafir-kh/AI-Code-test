import type { TestStep, TestStepRole } from "@/db/schema";

export const MAX_TEST_STEPS = 25;

const allowedRoles: TestStepRole[] = [
  "button",
  "link",
  "textbox",
  "checkbox",
  "radio",
  "heading",
  "combobox",
  "option",
];

export function isTestStep(value: unknown): value is TestStep {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const step = value as Record<string, unknown>;

  if (step.action === "navigate") {
    return (
      typeof step.path === "string" &&
      step.path.length <= 500 &&
      isLocalRoute(step.path)
    );
  }

  if (step.action === "expectText") {
    return (
      typeof step.text === "string" &&
      step.text.trim().length > 0 &&
      step.text.length <= 1000
    );
  }

  if (
    step.action === "click" ||
    step.action === "expectVisible" ||
    step.action === "fill"
  ) {
    if (
      typeof step.role !== "string" ||
      !allowedRoles.includes(step.role as TestStepRole) ||
      typeof step.name !== "string" ||
      step.name.trim().length === 0 ||
      step.name.length > 200
    ) {
      return false;
    }

    return (
      step.action !== "fill" ||
      (typeof step.value === "string" && step.value.length <= 2000)
    );
  }

  return false;
}

export function isLocalRoute(path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return false;
  }

  try {
    return new URL(path, "http://localhost").origin === "http://localhost";
  } catch {
    return false;
  }
}
