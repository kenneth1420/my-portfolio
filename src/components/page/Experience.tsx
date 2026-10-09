"use client";

import { experiences } from "@/src/data/resume";
import RoleDetail from "./experience/RoleDetail";
import SectionHeading from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";

const ROLE_IDS = experiences.map((_, i) => `role-${i}`);

/**
 * Work history as tabs: the employers form the tab list, and choosing one
 * swaps in that role's metrics, scope, and deliverables. On wide screens the
 * list is a sticky rail beside the panel; on narrow ones it is a strip above
 * it that scrolls sideways.
 */
export default function Experience() {
  return (
    <section id="experience" className="py-28 px-6">
      <Tabs
        defaultValue={ROLE_IDS[0]}
        className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-20"
      >
        <div className="lg:sticky lg:top-28 self-start min-w-0">
          <SectionHeading
            index="03"
            eyebrow="Experience"
            title="Work"
            accent="history"
          />

          <Reveal>
            <TabsList
              aria-label="Employers"
              className="mt-10 gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-border lg:pb-0"
            >
              {experiences.map((exp, i) => (
                <TabsTrigger
                  key={ROLE_IDS[i]}
                  value={ROLE_IDS[i]}
                  className="shrink-0 rounded-full border border-border px-4 py-2 text-left text-sm text-text-dim hover:text-text data-[state=active]:border-primary/50 data-[state=active]:bg-primary/15 data-[state=active]:text-primary-strong lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:py-2.5 lg:pl-5 lg:data-[state=active]:border-primary lg:data-[state=active]:bg-transparent"
                >
                  {exp.company}
                  <span className="hidden lg:block font-mono text-[11px] text-text-dim mt-0.5">
                    {exp.period}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Reveal>
        </div>

        <Reveal className="min-w-0">
          {experiences.map((exp, i) => (
            <TabsContent key={ROLE_IDS[i]} value={ROLE_IDS[i]}>
              <RoleDetail role={exp} />
            </TabsContent>
          ))}
        </Reveal>
      </Tabs>
    </section>
  );
}
