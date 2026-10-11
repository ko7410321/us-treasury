import { createServerFn } from "@tanstack/react-start";
import type { CurvePayload } from "@/lib/curve";

export const refreshCurve = createServerFn({ method: "GET" }).handler(async (): Promise<CurvePayload | null> => {
  try {
    const { loadCurve } = await import("@/lib/curve.fetch.server");
    return await loadCurve();
  } catch (error) {
    console.error(error);
    return null;
  }
});
