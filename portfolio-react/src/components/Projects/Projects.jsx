import React from "react";

const projectsData = [
  {
    id: 1,
    name: "Match Analysis",
    language: "Python",
    description:
      "Expected Goals (xG) calculation model using tracking data and shot location matrices.",
    html_url: "https://github.com/21lj/sports_analytics",
  },
  {
    id: 2,
    name: "Euro 2k24 Shot Map",
    language: "Python",
    description:
      "Interactive pass network visualization tool for tactical match analysis.",
    html_url: "https://github.com/21lj/ShotMap",
  },
  {
    id: 3,
    name: "BookMysnacks",
    language: "Python",
    description:
      "Online snack booking platform for theaters.",
    html_url:
      "https://github.com/21lj/python_projects/tree/main/bookmysnacks",
  },
  {
    id: 4,
    name: "Heart Disease Predictor",
    language: "Python",
    description:
      "Machine learning model to predict heart disease.",
    html_url:
      "https://github.com/21lj/python_projects/tree/main/heartDiseasePrediction",
  },
];

const Projects = () => {
  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-slate-950 text-slate-100 py-16 px-6"
    >
      {/* Background Grid Accent */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            FEATURED PROJECTS
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Featured Codebases & Tools
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            A collection of analytics projects, machine learning models, and
            software tools built using Python.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map((repo) => (
            <div
              key={repo.id}
              className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Title + Language */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {repo.name}
                  </h3>

                  {repo.language && (
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      {repo.language}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {repo.description}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  {repo.language}
                </span>

                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm inline-flex items-center gap-1 transition-colors"
                >
                  View Code →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;