import { z } from "zod";
import { KnowledgeEntityV2Schema, RecommendationV2Schema } from "./v2-schemas.js";

export const KnowledgeEntityV21Schema = KnowledgeEntityV2Schema.extend({
  kind: z.enum(["rule", "pattern", "anti-pattern", "component", "composition"])
});
export const RecommendationV21Schema = z.object({
  ...RecommendationV2Schema.shape,
  schemaVersion: z.literal("2.1"), componentCatalogVersion: z.string().min(1),
  entities: z.array(KnowledgeEntityV21Schema)
}).strict().superRefine((packet, ctx) => {
  // Reuse every v2 reference/coverage/conflict invariant without widening the strict 2.0 contract.
  const rest = { ...packet };
  Reflect.deleteProperty(rest, "componentCatalogVersion");
  const projected = { ...rest, schemaVersion: "2.0", entities: packet.entities.map(entity => ({ ...entity,
    kind: entity.kind === "component" || entity.kind === "composition" ? "pattern" : entity.kind
  })) };
  const result = RecommendationV2Schema.safeParse(projected);
  if (!result.success) for (const issue of result.error.issues) ctx.addIssue({ code: "custom", message: issue.message, path: issue.path });
});
export type KnowledgeEntityV21 = z.infer<typeof KnowledgeEntityV21Schema>;
export type RecommendationV21 = z.infer<typeof RecommendationV21Schema>;
