import React from "react";
import Lijo_Joseph_Resume from "../../assets/Lijo_Joseph_Resume.pdf";
import footballBg from "../../assets/football-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      
      <div className="absolute inset-0">
        <img
          src={footballBg}
          alt=""
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-slate-950/85" />
      </div>

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center px-6 py-16 sm:px-10 lg:px-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-3xl text-center lg:text-left">

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-mono tracking-wider text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
              FOOTBALL ANALYTICS ENTHUSIAST
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Lijo Joseph
            </h1>

            <h2 className="mt-3 text-lg font-semibold text-emerald-400 sm:text-xl md:text-2xl">
              Tactical Breakdown & Data Modeling
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg lg:mx-0">
              Passionate about breaking down pitch dynamics, modern pressing
              schemes, and team telemetry. Exploring advanced match metrics
              (xG, PPDA, and pass networks) to translate raw game data into
              tactical stories.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              
              <a
                href="#contact"
                className="rounded-lg bg-emerald-500 px-7 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-600"
              >
                Contact Me
              </a>

              <a
                href={Lijo_Joseph_Resume}
                download="Lijo_Joseph_CV.pdf"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-7 py-3 font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <svg
                  className="h-5 w-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>

                Download CV
              </a>

            </div>

          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;