export function setEnterDirection<T>(
  items: readonly T[],
  from: T,
  to: T,
  scope?: HTMLElement | null,
): 1 | -1 | 0;
export function enterDirectionFromReferrer(paths: readonly string[]): 1 | -1;
export function enterDirectionScript(paths: readonly string[]): string;
