import React from 'react';

const Footer = () => {
  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-slate-800/80 py-12 px-6 overflow-hidden">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Top Row: Quote & Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Double Meaning Football Quote */}
          <div className="md:col-span-8 space-y-2">
            <blockquote className="text-slate-200 text-sm sm:text-base font-semibold italic border-l-2 border-emerald-500 pl-4 py-1">
              "The harder you stroke it into the box, the better the finish."
            </blockquote>
            <p className="text-xs font-mono text-emerald-400 pl-4">
              // TACTICAL LESSON #90: EXECUTION & PRECISION
            </p>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-4 flex flex-wrap md:justify-end gap-4 text-xs font-mono">
            <a href="#about" className="hover:text-emerald-400 transition-colors">
              About
            </a>
            <a href="#projects" className="hover:text-emerald-400 transition-colors">
              Projects
            </a>
            <a href="#certifications" className="hover:text-emerald-400 transition-colors">
              Certifications
            </a>
            <a href="#contact" className="hover:text-emerald-400 transition-colors">
              Contact
            </a>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-900" />

        {/* Bottom Row: Copyright & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} Lijo Joseph. Built with React & Tailwind CSS.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FULL TIME // 90+ EXTRA TIME</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;