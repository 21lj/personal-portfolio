import React from 'react';
import me from '../../assets/me.png'
import stats from '../../assets/stats.png'

const About = () => {
  return (
    <section id="about" className="relative bg-slate-950 text-slate-100 py-16 px-6 overflow-hidden">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            SCOUTING BRIEF
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About Me
          </h2>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          
          {/* Round Profile Image */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 group-hover:opacity-70 blur transition duration-300 pointer-events-none" />
              
              {/* Avatar Container */}
              {/* <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full border-2 border-emerald-500/40 p-1 bg-slate-900">
                <img
                  src={me} 
                  alt="Lijo Joseph"
                  className="w-full h-full rounded-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                />
              </div> */}


              <div className="relative w-56 h-[316px] sm:w-64 sm:h-[362px] [perspective:1000px] group">
      {/* Glow effect behind the card */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 group-hover:opacity-60 blur transition duration-500 pointer-events-none" />

      {/* 3D Flip Inner Container */}
      <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(-180deg)] transition-transform rounded-2xl border-2 border-emerald-500/40 p-1 bg-slate-900 shadow-xl">
        
        {/* FRONT SIDE (Default Image) */}
        <div className="absolute inset-1 [backface-visibility:hidden] rounded-xl overflow-hidden bg-slate-950">
          <img
            src={me}
            alt="Lijo Joseph - Front"
            className="w-full h-full object-cover object-center contrast-125 group-hover:grayscale-0 transition-all duration-300"
          />
          <div className="absolute bottom-8 left-2 bg-slate-900/90 border border-emerald-500/30 text-emerald-400 font-mono text-xs px-3 py-1 rounded-full shadow-lg">
                22 Y/O
              </div>
          
        </div>

        {/* BACK SIDE (Hover Image - Flipped Left) */}
        <div className="absolute inset-1 [backface-visibility:hidden] [transform:rotateY(-180deg)] rounded-xl overflow-hidden bg-slate-950">
          <img
            src={stats}
            alt="Lijo Joseph - Back"
            className="w-full h-full object-cover object-center contrast-110"
          />
          
        </div>

      </div>

    </div>
              
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              I’m <strong className="text-emerald-400 font-bold">Lijo Joseph</strong>, an aspiring sports analyst with a deep obsession for tactical structures, defensive organization, and data-driven match analysis. 
            </p>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Combining computational tools with match breakdown, I analyze spatial positioning, press resistance, and team performance metrics to turn raw pitch actions into actionable strategic insights.
            </p>

            <div className="border-l-2 border-emerald-500/50 pl-4 py-1 italic text-slate-400 text-sm">
              "If I have to make a tackle, then I have already made a mistake." 
              <span className="block not-italic text-xs font-mono text-emerald-400 mt-1">— Paolo Maldini (Defensive Positioning Principle)</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default About;