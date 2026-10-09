import dynamic from "next/dynamic";
import About from "../components/page/About";
import Contact from "../components/page/Contact";
import Experience from "../components/page/Experience";
import Footer from "../components/page/Footer";
import Projects from "../components/page/Projects";
import Skills from "../components/page/Skills";
import SceneLayout from "../components/scene/SceneLayout";
import MotionProvider from "../components/ui/MotionProvider";
import PageLoader from "../components/ui/PageLoader";

const Hero = dynamic(() => import("../components/page/Hero"));
const Navbar = dynamic(() => import("../components/page/Navbar"));

export default function Home() {
  return (
    <MotionProvider>
      <PageLoader>
        {/* WebGL wave fabric fixed behind everything at z-0; the content rides
            above it at z-10. Its mint point light follows the cursor, which
            replaces the CSS CursorGlow and DepthBackground that sat here. */}
        {/* Bottom padding keeps the floating dock clear of the footer's
            last line once the reader reaches the end. */}
        <SceneLayout className="flex flex-col flex-1 min-h-screen mesh-bg font-body pb-24 sm:pb-28">
          <Navbar />
          <main className="flex flex-col flex-1 w-full">
            <Hero />
            <Projects />
            <About />
            <Experience />
            <Skills />
            <Contact />
          </main>
          <Footer />
        </SceneLayout>
        <div aria-hidden="true" className="grain" />
      </PageLoader>
    </MotionProvider>
  );
}
