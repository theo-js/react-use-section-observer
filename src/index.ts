"use client";

import { useEffect, useRef, type DependencyList } from "react";

export interface SectionObserverOptions {
  /**
   * Array of section IDs to observe.
   * Each ID should correspond to an element in the DOM that you want to track.
   */
  ids: string[];

  /**
   * Enable or disable the observer.
   * If your sections are dynamically added or removed, you can set this to false
   * until the sections are ready, then set it to true to start observing.
   */
  enabled?: boolean;

  /**
   * The root element for the Intersection Observer.
   * Defaults to the viewport if not specified.
   */
  viewportRoot?: Element | null;

  /** Class name(s) to apply to the active link */
  activeClassName?: string;

  /**
   * Callback function invoked when the active element changes.
   * Receives an object containing the active link and the corresponding active section element.
   */
  onActiveChange?: (params: {
    link: Element;
    activeElement: Element | null;
  }) => void;

  /**
   * Optional accessors to customize how links are selected and how active state is determined.
   * This allows you to adapt the hook to different DOM structures and link formats.
   */
  linkAccessors?: {
    getLinkSelector: (id: string) => string;
    getIsLinkActive: (params: {
      link: Element;
      activeElement: Element;
    }) => boolean;
  };
}

/**
 * React hook to observe sections and update corresponding links
 * based on their visibility in the viewport.
 */
export function useSectionObserver(
  {
    ids,
    enabled = true,
    viewportRoot = null,
    activeClassName = "active",
    onActiveChange,
    linkAccessors: linkAccessor,
  }: SectionObserverOptions,
  deps: DependencyList = [],
): void {
  const {
    getLinkSelector = (id: string) => `a[href$="#${id}"]`,
    getIsLinkActive = ({
      link,
      activeElement,
    }: {
      link: Element;
      activeElement: Element;
    }) => link.getAttribute("href")?.endsWith(`#${activeElement?.id}`),
  } = linkAccessor || {};

  const entriesRef = useRef<Map<Element, IntersectionObserverEntry>>(new Map());

  useEffect(() => {
    if (!enabled || !ids.length) return;

    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const links = ids
      .map((id) => document.querySelector(getLinkSelector(id)))
      .filter((el): el is Element => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entriesRef.current.set(entry.target, entry);
        });

        const activeElement = resolveActiveElement(entriesRef.current);

        links.forEach((link) => {
          const isActive =
            activeElement && getIsLinkActive({ link, activeElement });

          toggleClass(link, activeClassName, Boolean(isActive));

          if (isActive && onActiveChange) {
            onActiveChange({ link, activeElement });
          }
        });
      },
      {
        root: viewportRoot,
        threshold: buildThresholdList(),
      },
    );

    targets.forEach((el) => observer.observe(el as HTMLElement));

    return () => {
      observer.disconnect();
      entriesRef.current.clear();

      links.forEach((link) => toggleClass(link, activeClassName, false));
    };
  }, [
    ids.join(","),
    enabled,
    viewportRoot,
    activeClassName,
    onActiveChange,
    ...deps,
  ]);
}

/* ---------- Internal helpers ---------- */

function resolveActiveElement(
  entries: Map<Element, IntersectionObserverEntry>,
): Element | null {
  const visible = Array.from(entries.values()).filter(
    (entry) => entry.isIntersecting,
  );

  if (!visible.length) return null;

  // Priority : highest visible ratio
  visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  return visible[0].target;
}

function toggleClass(element: Element, className: string, active: boolean) {
  const tokens = className.trim().split(/\s+/); // Support multiple class names separated by space
  element.classList[active ? "add" : "remove"](...tokens);
}

function buildThresholdList(step = 0.1): number[] {
  const thresholds: number[] = [];
  for (let i = 0; i <= 1; i += step) {
    thresholds.push(Number(i.toFixed(2)));
  }
  return thresholds;
}
