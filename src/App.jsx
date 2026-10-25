

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import RevealOnScroll from "./components/RevealOnScroll";
import "./App.css";

function App() {
  return (
    <>
    <RevealOnScroll>
      <Navbar />
    </RevealOnScroll>

      <RevealOnScroll>
      <Hero />
      </RevealOnScroll>

    <RevealOnScroll>
      <About />
    </RevealOnScroll>

    <RevealOnScroll>
      <Skills />
    </RevealOnScroll>

      
    <RevealOnScroll>
      <Projects />
    </RevealOnScroll>

    <RevealOnScroll>
      <Contact />
    </RevealOnScroll>

    <RevealOnScroll>
      <Footer />
    </RevealOnScroll>

    
    </>
  );
}

export default App;
