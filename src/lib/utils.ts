import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names and lets a later Tailwind utility override an earlier one. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Frame-rate independent easing factor for an exponential approach: step a
 * value toward its goal by `(goal - value) * damp(rate, delta)` each frame.
 * Higher rates snap faster.
 */
export const damp = (rate: number, delta: number) => 1 - Math.exp(-rate * delta);
