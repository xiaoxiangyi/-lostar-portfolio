// 在 GitHub Pages 部署時，所有資源實際上位於 `/<repo>/...` 路徑下。
// Next.js 的 basePath 只會自動套用到內建路由與 next/image，
// 對普通 <img>、CSS url()、download href 都不會自動前綴，需要手動處理。
// 本機 dev：NEXT_PUBLIC_BASE_PATH 為空字串，asset("/foo") === "/foo"
// CI build：NEXT_PUBLIC_BASE_PATH 為 "/<repo>"，asset("/foo") === "/<repo>/foo"
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path}`;
}
