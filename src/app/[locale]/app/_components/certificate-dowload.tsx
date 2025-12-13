"use client";

import { toPng } from "html-to-image";
import { Award01Icon } from "hugeicons-react";
import { useRef } from "react";
import { toast } from "sonner";

export function CertificateDownload({ userName, date }: { userName: string; date: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const downloadCert = async () => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `kirita-certified-expert-${userName}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Certificate downloaded!");
    } catch (e) {
      toast.error("Failed to download");
    }
  };

  return (
    <div className="relative group">
      {/* Botón de descarga visible */}
      <button
        onClick={downloadCert}
        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
      >
        <Award01Icon />
        Download Expert Analyst Certificate
      </button>

      {/* CERTIFICADO OCULTO (Para renderizar) */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
        <div
          ref={ref}
          className="w-[800px] h-[600px] bg-[#fff] p-10 flex flex-col items-center justify-center text-center border-[20px] border-double border-slate-900 relative"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

          <Award01Icon size={80} className="text-yellow-500 mb-6" />

          <h1 className="text-6xl font-black text-slate-900 mb-4 font-serif">CERTIFICATE</h1>
          <p className="text-xl text-slate-500 tracking-[0.2em] uppercase mb-12">OF ACHIEVEMENT</p>

          <p className="text-lg text-slate-600 mb-2">This certifies that</p>
          <h2 className="text-5xl font-bold text-primary mb-8 font-serif italic">{userName}</h2>

          <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
            Has successfully demonstrated mastery in App Market Analysis and is hereby recognized as
            an
          </p>

          <div className="mt-6 mb-12">
            <span className="text-3xl font-bold text-slate-900 border-b-2 border-yellow-500 pb-1">
              Industry Titan
            </span>
          </div>

          <div className="flex justify-between w-full px-20 mt-auto">
            <div className="text-left">
              <p className="font-bold text-slate-900">KiritaAI</p>
              <p className="text-xs text-slate-500 uppercase">Certification Authority</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">{date}</p>
              <p className="text-xs text-slate-500 uppercase">Date Issued</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
