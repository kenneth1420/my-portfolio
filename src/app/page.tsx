import About from "../components/page/About";
import Contact from "../components/page/Contact";
import Experience from "../components/page/Experience";
import Footer from "../components/page/Footer";
import Hero from "../components/page/Hero";
import Navbar from "../components/page/Navbar";
import Projects from "../components/page/Projects";
import Skills from "../components/page/Skills";
import SplashCursor from "../components/ui/SplashCursor";

export default function Home() {
  return (
    <>
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

      <SplashCursor />
    </>
  );
}
