import { motion } from 'framer-motion';
import { ExternalLink, X, Sparkles, Compass } from 'lucide-react';
import { useEffect } from 'react';

interface MessageInABottleProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessageInABottle({ isOpen, onClose }: MessageInABottleProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenInstagram = () => {
    window.open('https://instagram.com/pohonmimpicreatives', '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto pointer-events-auto bg-[#03030c]/75 backdrop-blur-md select-none"
      onClick={onClose}
    >
      {/* Background Star Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping opacity-30" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-purple-300 rounded-full animate-pulse opacity-40" />
      </div>

      {/* Floating Bottle & Paper Notebook Capsule */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 35, rotate: -2 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: [-5, 5, -5],
          rotate: [-1.2, 1, -1.2]
        }}
        exit={{ opacity: 0, scale: 0.85, y: 25, rotate: -3 }}
        transition={{
          opacity: { duration: 0.4, ease: 'easeOut' },
          scale: { duration: 0.4, ease: 'easeOut' },
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
        }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full my-auto"
      >
        {/* Glass Bottle Neck & Cork Stopper floating on top */}
        <div className="flex flex-col items-center -mb-5 relative z-20 pointer-events-none">
          {/* Cork Stopper with Twine */}
          <div className="w-16 h-8 bg-[#8f613c] border-2 border-[#5c3e23] rounded-t-md shadow-lg relative flex items-center justify-center overflow-hidden">
            {/* Cork texture lines */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#3d2411_1px,transparent_1px)] [background-size:4px_4px]" />
            {/* Twine rope wrap */}
            <div className="w-full h-1.5 bg-[#dfb27e] border-y border-[#704d2e] my-auto" />
            <span className="text-[8px] font-mono tracking-widest text-[#f5dec4] uppercase font-bold drop-shadow">
              SEALED
            </span>
          </div>

          {/* Bottle Lip */}
          <div className="w-24 h-4 bg-white/15 backdrop-blur-md border border-cyan-300/40 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.25)] -mt-1" />
          
          {/* Bottle Neck glass sheen */}
          <div className="w-20 h-6 bg-gradient-to-b from-white/10 to-transparent border-x border-cyan-300/30 backdrop-blur-sm -mt-1" />
        </div>

        {/* Glass Bottle Vessel Container */}
        <div className="relative rounded-[2.5rem] p-3 sm:p-5 bg-gradient-to-b from-cyan-500/10 via-white/[0.04] to-purple-500/10 border border-cyan-400/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_80px_rgba(56,189,248,0.18)] backdrop-blur-xl">
          {/* Glass specular highlights & reflections */}
          <div className="absolute top-6 left-6 w-3/4 h-12 bg-gradient-to-r from-white/20 via-white/5 to-transparent rounded-full blur-[1px] pointer-events-none -rotate-2" />
          <div className="absolute bottom-6 right-6 w-1/2 h-8 bg-gradient-to-l from-cyan-400/15 via-white/5 to-transparent rounded-full blur-[1px] pointer-events-none" />

          {/* REAL PAPER NOTEBOOK PAGE INSIDE BOTTLE */}
          <div className="notebook-paper-grid relative rounded-2xl p-6 sm:p-8 text-[#28241d] shadow-[0_15px_35px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.1)] border border-[#d8d0be] overflow-hidden">
            {/* Top Notebook Spiral / Perforation Holes */}
            <div className="flex justify-between items-center -mt-3 -mx-2 mb-4 px-2 border-b border-[#e2d8c3] pb-2">
              <div className="flex gap-2">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2.5 h-2.5 rounded-full bg-[#1b1924]/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] border border-[#c5bba6]" 
                  />
                ))}
              </div>
              
              {/* Close Button disguised as vintage brass paper-clip / pin */}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#e8deca] hover:bg-[#ded1ba] border border-[#b8ad96] flex items-center justify-center text-[#554d3e] hover:text-[#1e1b15] transition-colors shadow-sm cursor-pointer group"
                title="Release bottle back to space (Esc)"
              >
                <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Left Notebook Red Margin Line */}
            <div className="absolute top-12 bottom-6 left-12 w-px bg-[#e07a7a]/50 pointer-events-none" />

            {/* Washi Tape Strip at Corner */}
            <div className="absolute -top-3 left-1/3 -translate-x-1/2 w-28 h-6 bg-[#ebddc0]/80 backdrop-blur-xs border-y border-[#d3c29f] -rotate-2 shadow-xs pointer-events-none flex items-center justify-center text-[9px] font-mono tracking-widest text-[#7a6f56] uppercase">
              ✦ DISPATCH #042 ✦
            </div>

            {/* Notebook Content Layout */}
            <div className="relative pl-6 sm:pl-8 space-y-4">
              {/* Postal & Astronomical Header */}
              <div className="flex items-start justify-between border-b border-dashed border-[#d1c7b0] pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#726955]">
                    <Compass size={12} className="text-[#a45332]" />
                    <span>Bali Orbit // Star Coordinates 8°S 115°E</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-[#1c1813] mt-0.5">
                    Partner: Pohon Mimpi
                  </h2>
                </div>

                {/* Stamped Postal Seal */}
                <div className="shrink-0 w-14 h-14 border-2 border-dashed border-[#b94734]/70 rounded-full flex flex-col items-center justify-center text-[#b94734] rotate-[-8deg] p-1 shadow-xs select-none">
                  <span className="text-[7px] font-mono font-bold leading-none uppercase">CERTIFIED</span>
                  <span className="text-[8px] font-serif font-black leading-tight">POHON</span>
                  <span className="text-[8px] font-serif font-black leading-tight">MIMPI</span>
                  <span className="text-[6px] font-mono leading-none">BALI ✦ 2026</span>
                </div>
              </div>

              {/* Pompi Mascot Hand-drawn Sketch & Introduction */}
              <div className="flex items-center gap-4 bg-[#f2ecdc]/90 p-3.5 rounded-xl border border-[#ded4be] shadow-inner">
                {/* Hand-drawn Mascot Character: Pompi (Cute Seedling Spirit) */}
                <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#e7e1ce] rounded-2xl border border-[#c7bc9e] p-1.5 flex flex-col items-center justify-center relative shadow-sm">
                  {/* Mascot SVG Vector: Pompi */}
                  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Outer aura ring */}
                    <circle cx="50" cy="52" r="42" stroke="#7e9c74" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                    
                    {/* Head / Body Seedling */}
                    <path 
                      d="M50 82C66 82 76 68 76 50C76 33 64 24 50 24C36 24 24 33 24 50C24 68 34 82 50 82Z" 
                      fill="#86b27e" 
                      stroke="#32492d" 
                      strokeWidth="2.5" 
                      strokeLinejoin="round" 
                    />
                    
                    {/* Tree Sprout Foliage on Head */}
                    <path 
                      d="M50 24C50 14 43 7 37 9C31 11 36 22 50 24Z" 
                      fill="#5b9454" 
                      stroke="#274422" 
                      strokeWidth="2" 
                    />
                    <path 
                      d="M50 24C50 12 59 6 65 9C71 12 65 22 50 24Z" 
                      fill="#9ad08f" 
                      stroke="#274422" 
                      strokeWidth="2" 
                    />
                    
                    {/* Friendly Anime Eyes */}
                    <ellipse cx="40" cy="48" rx="4" ry="5.5" fill="#202e1c" />
                    <ellipse cx="60" cy="48" rx="4" ry="5.5" fill="#202e1c" />
                    <circle cx="41.5" cy="46" r="1.5" fill="#ffffff" />
                    <circle cx="61.5" cy="46" r="1.5" fill="#ffffff" />
                    
                    {/* Cute Rosy Cheeks */}
                    <ellipse cx="33" cy="56" rx="4.5" ry="2.5" fill="#e88989" opacity="0.75" />
                    <ellipse cx="67" cy="56" rx="4.5" ry="2.5" fill="#e88989" opacity="0.75" />
                    
                    {/* Happy Smile */}
                    <path d="M44 57C47 61 53 61 56 57" stroke="#202e1c" strokeWidth="2.2" strokeLinecap="round" />
                    
                    {/* Tiny Little Leaf Feet */}
                    <ellipse cx="42" cy="82" rx="5" ry="3" fill="#588550" stroke="#253821" strokeWidth="1.5" />
                    <ellipse cx="58" cy="82" rx="5" ry="3" fill="#588550" stroke="#253821" strokeWidth="1.5" />
                    
                    {/* Floating Star Sprout Sparkle */}
                    <path d="M78 28L80 34L86 36L80 38L78 44L76 38L70 36L76 34Z" fill="#e8b931" />
                  </svg>
                  <span className="text-[8px] font-mono tracking-tighter text-[#4a5843] font-bold mt-0.5">
                    POMPI
                  </span>
                </div>

                {/* Hand-written Message from Pompi */}
                <div className="flex-1 min-w-0">
                  <div className="font-handwriting text-lg sm:text-xl text-[#34402a] leading-tight font-bold">
                    "Meet Pompi, the mascot & creative guide!"
                  </div>
                  <p className="text-xs text-[#524b3c] font-sans mt-1 leading-relaxed">
                    Pompi will help with your <strong className="text-[#1f1b14] font-semibold">branding</strong>, <strong className="text-[#1f1b14] font-semibold">prototyping</strong>, <strong className="text-[#1f1b14] font-semibold">social campaigns</strong>, marketing videos, and <strong className="text-[#1f1b14] font-semibold">SEO boosts</strong>.
                  </p>
                </div>
              </div>

              {/* Notebook Letter Body */}
              <div className="space-y-2 text-xs sm:text-[13px] text-[#423c31] leading-relaxed font-sans">
                <p>
                  Floating through the void? <strong className="text-[#1f1c16]">Pohon Mimpi</strong> (Indonesian for <em>"Dream Tree"</em>) handles sustainable sourcing, design, and digital rollouts — from concept sketches to store shelves.
                </p>
                
                {/* Bullet items in field-notes style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono text-[#584f3f]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#2d8f63]">✔</span> Eco-friendly T-shirts & packaging
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#2d8f63]">✔</span> Social posts, reels & copywriting
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#2d8f63]">✔</span> Rapid prototyping & branding
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#2d8f63]">✔</span> High-converting visual compositions
                  </div>
                </div>
              </div>

              {/* Hand-stamped Action Tag: Find Pohon Mimpi */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#d8cfb9]">
                <button
                  onClick={handleOpenInstagram}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-[#26211a] hover:bg-[#3d362b] text-[#fbf7ee] py-2.5 px-5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
                >
                  <Sparkles size={14} className="text-[#e2b761] group-hover:rotate-12 transition-transform" />
                  <span>Find Pohon Mimpi</span>
                  <ExternalLink size={13} className="text-[#beb39e] group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Subtle Dismissal Tag */}
                <button
                  onClick={onClose}
                  className="text-[11px] font-mono text-[#8a7f6c] hover:text-[#383124] underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Release bottle back into space
                </button>
              </div>

              {/* Postscript in handwritten cursive */}
              <div className="text-[12px] font-handwriting text-[#7a6f58] italic pt-1">
                p.s. Visit @pohonmimpicreatives on Instagram for collaborations & custom production.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
