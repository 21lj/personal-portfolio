import React from 'react'
import Hero from './components/Hero/Hero'
import Projects from './components/Projects/Projects'
import Certifications from './components/Certifications/Certifications'
import About from './components/About/About'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'

const App = () => {
  return (
    <div
      className="
        bg-slate-950 
        min-h-screen 
        overflow-x-hidden 
        text-slate-100 
        font-sans 
        antialiased
        selection:bg-emerald-500 
        selection:text-slate-950 
        scroll-smooth
      "
    >
      <main>
        <Hero />
        <About />
        <Projects />
        <Certifications />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default App