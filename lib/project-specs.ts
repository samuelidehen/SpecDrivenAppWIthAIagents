export function specFilename(filePath: string): string {
  try {
    const pathname = new URL(filePath).pathname;
    return pathname.split("/").pop() || "spec.md";
  } catch {
    return filePath.split("/").pop() || "spec.md";
  }
}
