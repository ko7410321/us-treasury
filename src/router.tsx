import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return createRouter({
    routeTree,
    ...(base ? { basepath: base } : {}),
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
  });
}
