export function leave(
  el: Element | null | undefined,
  options?: { kind?: 'slide' | 'turnstile'; children?: boolean },
): Promise<void>;
export function continuum(
  item: Element | null | undefined,
  options?: { page?: Element | null; kind?: 'slide' | 'turnstile' },
): Promise<void>;
export function continuumIn(el: Element | null | undefined): Promise<void>;
export function attachTilt(root?: Document | HTMLElement): () => void;
export function attachPanorama(el: HTMLElement): () => void;
