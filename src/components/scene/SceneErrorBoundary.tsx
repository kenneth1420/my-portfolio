"use client";

import { Component, type ReactNode } from "react";

interface IProps {
  children: ReactNode;
  /** Told when the scene throws, so the caller can switch to a fallback. */
  onError?: () => void;
}

interface IState {
  hasError: boolean;
}

/**
 * Contains any failure in a WebGL scene: a chunk that fails to load,
 * a lost GPU context, or a bug in the render loop. The scene is decoration,
 * so if it throws, it disappears and the page carries on. Without this
 * boundary, the error would reach the route's error boundary and replace the
 * whole portfolio.
 *
 * A class because React still exposes error boundaries only through class
 * lifecycles.
 */
export default class SceneErrorBoundary extends Component<IProps, IState> {
  state: IState = { hasError: false };

  static getDerivedStateFromError(): IState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
