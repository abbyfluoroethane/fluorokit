export function leave(
  el: Element | null | undefined,
  options?: { kind?: 'slide' | 'turnstile'; children?: boolean },
): Promise<void>;
export interface ContinuumPosition {
  left: number;
  top: number;
  fontSize: number;
}
export function continuum(
  item: Element | null | undefined,
  options?: { page?: Element | null; kind?: 'slide' | 'turnstile' },
): Promise<ContinuumPosition | null>;
export function continuumIn(
  el: Element | null | undefined,
  options?: { from?: ContinuumPosition | null },
): Promise<void>;
export function attachTilt(root?: Document | HTMLElement): () => void;
export function attachPanorama(el: HTMLElement): () => void;
