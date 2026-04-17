// ═══════════════════════════════════════════════════════════════
// animationSequence — staggered animation helpers
// Compute per-element delays and apply CSS custom properties.
// ═══════════════════════════════════════════════════════════════

export interface AnimationSequenceOptions {
  /** Milliseconds between each element. Default: 50 */
  staggerMs?: number;
  /** Order in which elements receive delay. Default: "forward" */
  direction?: "forward" | "reverse" | "center";
}

/**
 * Simple stagger: return `${index * staggerMs}ms`.
 */
export function staggerDelay(index: number, staggerMs?: number): string {
  return `${index * (staggerMs ?? 50)}ms`;
}

/**
 * Direction-aware stagger delay.
 *
 * - forward: index * stagger
 * - reverse: (total - 1 - index) * stagger
 * - center:  |index - floor(total/2)| * stagger
 */
export function getStaggerDelay(
  index: number,
  total: number,
  options: AnimationSequenceOptions = {},
): string {
  const stagger = options.staggerMs ?? 50;
  const direction = options.direction ?? "forward";

  let delay: number;

  switch (direction) {
    case "reverse":
      delay = (total - 1 - index) * stagger;
      break;
    case "center":
      delay = Math.abs(index - Math.floor(total / 2)) * stagger;
      break;
    default:
      delay = index * stagger;
  }

  return `${delay}ms`;
}

/**
 * Apply a staggered animation class to a list of elements.
 * Sets `--vf-stagger-delay` CSS custom property on each element.
 *
 * @returns Cleanup function that removes the class and property.
 */
export function staggerAnimation(
  elements: Element[],
  animationClass: string,
  options: AnimationSequenceOptions = {},
): () => void {
  const total = elements.length;

  for (let i = 0; i < total; i++) {
    const el = elements[i] as HTMLElement;
    const delay = getStaggerDelay(i, total, options);
    el.style.setProperty("--vf-stagger-delay", delay);
    el.classList.add(animationClass);
  }

  return () => {
    for (const el of elements) {
      const htmlEl = el as HTMLElement;
      htmlEl.style.removeProperty("--vf-stagger-delay");
      htmlEl.classList.remove(animationClass);
    }
  };
}
