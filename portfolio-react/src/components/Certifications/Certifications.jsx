import React from "react";

const certificationsData = [
  {
    id: 1,
    name: "Introduction to IoT",
    issuer: "NPTEL & IIT Khangpur",
    year: "2023",
    url: "https://drive.google.com/file/d/1AhiwM7NY082yJubBAwZ48q2Au8N2b5fh/view?usp=drive_link",
  },
  {
    id: 2,
    name: "Programming in Modern C++",
    issuer: "NPTEL & IIT Khangpur",
    year: "2023",
    url: "https://drive.google.com/file/d/1uZ0dqDF_Zsvo2e_1ic_roPf_0mbex5Am/view?usp=drive_link",
  },
  {
    id: 3,
    name: "Certificate of publication",
    issuer: "IRJAEM",
    year: "2024",
    url: "https://drive.google.com/file/d/14grR85qILcdFlBKjiOJNzXcDd5IMgrsB/view?usp=drive_link",
  },
  {
    id: 4,
    name: "SE job simulation",
    issuer: "Forage & EA Sports",
    year: "2024",
    url: "https://drive.google.com/file/d/1AhiwM7NY082yJubBAwZ48q2Au8N2b5fh/view?usp=drive_link",
  },
  {
    id: 5,
    name: "Introduction to LLMs",
    issuer: "NPTEL & IIT Delhi",
    year: "2026",
    url: "https://drive.google.com/file/d/1mk_d26OwZ3k4bkWFzo58MrIJs622P_XI/view?usp=drive_link2",
  },
];

const Certifications = () => {
  return (
    <section
      id="certifications"
      className="relative overflow-hidden bg-slate-950 text-slate-100 py-16 px-6"
    >
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ACCREDITATIONS & BADGES
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Certifications & Training
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Aspiring, Learning & Training from the best!
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-md divide-y divide-slate-800">
          {certificationsData.map((cert, index) => (
            <a
              key={cert.id}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 hover:bg-slate-900 transition-colors group gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {cert.issuer}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-mono text-slate-400">
                  {cert.year}
                </span>
                <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Verify Credential →
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Certifications;