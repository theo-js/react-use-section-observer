"use client";

import { useSectionObserver } from "react-use-section-observer";
import { links } from "./links";
import { useEffect, useRef, useState } from "react";

const LOADING_DURATION = 3000; // Adjust as needed

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const linksContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), LOADING_DURATION);
    return () => clearTimeout(timeout);
  }, []);

  useSectionObserver({
    ids: links.map((link) => link.id),
    enabled: !isLoading,
    activeClassName: "bg-blue-500 text-white",
    onActiveChange: ({ link }) => {
      link.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
  });

  if (isLoading)
    return (
      <div className="p-2 flex items-center justify-center min-h-screen">
        <div className="flex flex-col gap-4 items-center justify-center max-w-xl text-center">
          <p className="text-3xl">
            Simulating loading...{" (" + LOADING_DURATION / 1000 + "s)"}
          </p>
          <p className="text-xl text-foreground/50">
            <code>useVisibilityTracker</code> was already initialized and is
            waiting for content to be displayed
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        ref={linksContainerRef}
        className="h-screen border-foreground/30 border-r-1 w-48 flex flex-col overflow-y-auto"
      >
        {links.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className="block p-2 text-center text-foreground/50 hover:text-foreground border-b border-foreground/30 last:border-0"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Content */}
      <div className="h-screen overflow-y-auto w-full">
        {links.map((link) => (
          <section
            key={link.id}
            id={link.id}
            className="w-full h-[50dvh] box-content flex items-center justify-center text-3xl border-b border-b-2 border-dashed border-foreground/30 last:border-0"
          >
            {link.label}
          </section>
        ))}
      </div>
    </div>
  );
}
