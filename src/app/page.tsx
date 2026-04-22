"use client";

import dynamic from "next/dynamic";
import About from "../components/page/About";
import Contact from "../components/page/Contact";
import Experience from "../components/page/Experience";
import Footer from "../components/page/Footer";
import Projects from "../components/page/Projects";
import Skills from "../components/page/Skills";
import PageLoader from "../components/ui/PageLoader";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useWindowSize } from "../hook/use.window.size.hook";

const SplashCursor = dynamic(() => import("../components/ui/SplashCursor"));
const Hero = dynamic(() => import("../components/page/Hero"));
const Navbar = dynamic(() => import("../components/page/Navbar"));

export default function Home() {
  const { width } = useWindowSize();

  return (
    <>
      <PageLoader>
        <div className="flex flex-col flex-1 min-h-screen mesh-bg font-body">
          <Navbar />
          <main className="flex flex-col flex-1 w-full">
            <Hero />
            <About />
            <Skills />
            <Experience />
            <Projects />
            <Contact />
          </main>
          <Footer />
        </div>
        {width === 0 || width < 768 ? null : <SplashCursor />}
        <ThemeToggle />
      </PageLoader>
    </>
  );
}
