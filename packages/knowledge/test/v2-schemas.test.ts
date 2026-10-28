import { describe, expect, it } from "vitest";
import { ContextV2Schema, TextEvidenceSchema } from "../src/index.js";

describe("v2 context schema", () => {
  it("has explicit unknown defaults without inferring application from industry", () => {
    const context = ContextV2Schema.parse({ schemaVersion: "2.0", industry: { value: "healthcare", status: "explicit" } });
    expect(context.applicationType).toMatchObject({ value: null, status: "unknown" });
    expect(context.tasks.primary.status).toBe("unknown");
  });
  it("rejects unknown fields, versions, unbounded inputs and inconsistent evidence", () => {
    for (const input of [{}, { schemaVersion: "1.0" }, { schemaVersion: "2.0", scanner: true }, { schemaVersion: "2.0", roles: Array(11).fill({ value: null, status: "unknown" }) }]) expect(() => ContextV2Schema.parse(input)).toThrow();
    for (const input of [{ value: "ecommerce", status: "unknown" }, { value: null, status: "explicit" }, { value: "", status: "observed" }, { value: "known", status: "inferred", secret: true }]) expect(() => TextEvidenceSchema.parse(input)).toThrow();
  });
});
