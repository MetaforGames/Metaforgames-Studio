import { ArrowLeft, ExternalLink, Library, Map, MousePointer2, Move, Heart, GraduationCap, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Artwork } from '../data/artworks';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface UIProps {
  selectedArtwork: Artwork | null;
  onBack: () => void;
  portfolioActive: boolean;
  onPortfolioClick: () => void;
  cinematicMode?: boolean;
  onToggleCinematic?: () => void;
  showUI: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  onOpenPohonMimpi?: () => void;
}

export function UI({ selectedArtwork, onBack, portfolioActive, onPortfolioClick, cinematicMode, onToggleCinematic, showUI, onNext, onPrev, onOpenPohonMimpi }: UIProps) {
  const [time, setTime] = useState(new Date());
  const [showLinks, setShowLinks] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll > 0) {
        setScrollProgress(scrollTop / maxScroll);
      } else {
        setScrollProgress(0);
      }
    }
  };

  useEffect(() => {
    setScrollProgress(0);
  }, [selectedArtwork]);

  const [showTooltips, setShowTooltips] = useState(true);

  useEffect(() => {
    if (cinematicMode) {
      const timer = setTimeout(() => setShowTooltips(false), 1300);
      return () => clearTimeout(timer);
    } else {
      setShowTooltips(true);
    }
  }, [cinematicMode]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col overflow-hidden">
      {/* Film Mode Black Bars */}
      <div 
        className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-[#0c0c0c] pointer-events-none z-0 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
        style={{ transform: portfolioActive ? 'translateY(0)' : 'translateY(-100%)' }} 
      />
      <div 
        className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-[#0c0c0c] pointer-events-none z-0 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
        style={{ transform: portfolioActive ? 'translateY(0)' : 'translateY(100%)' }} 
      />

      <div className="relative z-10 p-4 md:p-8 flex flex-col h-full pointer-events-none">
        {/* Header layer for normal view */}
        <AnimatePresence>
          {!selectedArtwork && showUI && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              className="w-full flex justify-between items-center pointer-events-auto bg-transparent text-white px-6 py-4 rounded-xl"
            >
              <div className="flex-1 font-bold tracking-widest text-sm uppercase">
                metafor games
              </div>
              
              <div className="flex-1 flex justify-center gap-6 text-sm font-medium">
                <button className="hover:opacity-70 transition-opacity">About</button>
                <button onClick={onPortfolioClick} className="hover:opacity-70 transition-opacity">
                  {portfolioActive ? "Map" : "Portfolio"}
                </button>
                <button className="hover:opacity-70 transition-opacity">Archived</button>
              </div>
              
              <div className="flex-1 flex justify-end text-sm font-medium">
                <button onClick={() => setShowLinks(true)} className="hover:opacity-70 transition-opacity">Contact</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Linktree Popup */}
        <AnimatePresence>
          {showLinks && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowLinks(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0c0c0c] border border-white/10 p-8 rounded-2xl w-full max-w-sm flex flex-col gap-4 text-center relative"
              >
                <button 
                  onClick={() => setShowLinks(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white"
                >
                  <X size={20} />
                </button>

                <h3 className="text-2xl font-bold tracking-widest uppercase text-white mb-4">Connect</h3>
                
                <a href="#" className="flex justify-center items-center gap-3 w-full bg-white/5 hover:bg-white/10 text-white font-mono text-sm py-4 rounded-xl transition-colors border border-white/5">
                   Github
                </a>
                <a href="#" className="flex justify-center items-center gap-3 w-full bg-white/5 hover:bg-white/10 text-white font-mono text-sm py-4 rounded-xl transition-colors border border-white/5">
                   Itch IO
                </a>
                <a href="#" className="flex justify-center items-center gap-3 w-full bg-white/5 hover:bg-white/10 text-white font-mono text-sm py-4 rounded-xl transition-colors border border-white/5">
                   Bluesky
                </a>
                <a href="#" className="flex justify-center items-center gap-3 w-full bg-white/5 hover:bg-white/10 text-white font-mono text-sm py-4 rounded-xl transition-colors border border-white/5">
                   X (Twitter)
                </a>
                <a href="#" className="flex justify-center items-center gap-3 w-full bg-white/5 hover:bg-white/10 text-white font-mono text-sm py-4 rounded-xl transition-colors border border-white/5">
                   Instagram
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!selectedArtwork && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full mt-auto flex justify-between items-center pb-4 font-mono text-xs uppercase tracking-widest text-white/50 pointer-events-auto"
            >
              {/* Column 1: Time */}
              <div className="flex-1 text-left">
                {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
              </div>
              
              {/* Column 2: Made by... */}
              <div className="flex-1 text-center flex flex-col items-center">
                <span>
                  Made by{' '}
                  <button 
                    onClick={onOpenPohonMimpi}
                    className="hover:text-cyan-300 transition-colors pointer-events-auto cursor-pointer inline-flex items-center gap-1 group font-medium"
                    title="Open message in a bottle from Pohon Mimpi"
                  >
                    <span>Pohon Mimpi</span>
                    <span className="text-[11px] group-hover:rotate-12 transition-transform">🍾</span>
                  </button>
                </span>
              </div>

              {/* Column 3: Terms */}
              <div className="flex-1 text-right pointer-events-auto">
                <button className="hover:text-white transition-colors">Terms & Conditions</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Tooltips / Buttons */}
        <AnimatePresence>
          {!selectedArtwork && showUI && (
            <div className="absolute inset-0 pointer-events-none z-[99999999]">
              {portfolioActive ? (
                <>
                   {/* Centered label */}
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute top-28 sm:top-32 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-[99999]"
                   >
                     <div className="bg-black px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2">
                        <MousePointer2 size={16} className="text-emerald-400" />
                        <p className="text-white font-mono text-xs tracking-widest uppercase">
                           Swipe or Drag
                        </p>
                     </div>
                   </motion.div>

                   {/* Left Arrow */}
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-12 pointer-events-none"
                   >
                     <button onClick={() => window.dispatchEvent(new CustomEvent('carousel-prev'))} className="pointer-events-auto bg-black/60 hover:bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/10 text-white shadow-lg transition-colors flex items-center justify-center group" aria-label="Previous">
                        <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                     </button>
                   </motion.div>

                   {/* Right Arrow */}
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-12 pointer-events-none"
                   >
                     <button onClick={() => window.dispatchEvent(new CustomEvent('carousel-next'))} className="pointer-events-auto bg-black/60 hover:bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/10 text-white shadow-lg transition-colors flex items-center justify-center group" aria-label="Next">
                        <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                     </button>
                   </motion.div>
                </>
              ) : (
                <AnimatePresence>
                  {showTooltips && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 pointer-events-none"
                    >
                      <div className="bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2">
                          <MousePointer2 size={16} className="text-emerald-400" />
                          <span className="text-white font-mono text-xs tracking-widest uppercase">Drag to Pan</span>
                      </div>
                      <div className="hidden sm:flex bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg items-center gap-2">
                          <Move size={16} className="text-emerald-400" />
                          <span className="text-white font-mono text-xs tracking-widest uppercase">Scroll to Zoom</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Sidebar: Message in a Bottle (Pohon Mimpi) */}
        <AnimatePresence>
          {!selectedArtwork && showUI && !portfolioActive && (
            <motion.div 
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.9 }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 pointer-events-none z-[90]"
            >
              <button 
                onClick={onOpenPohonMimpi}
                className="pointer-events-auto group relative flex items-center bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-cyan-400/40 hover:border-cyan-400/80 p-3 sm:p-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_25px_rgba(56,189,248,0.25)] transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Message in a Bottle · Pohon Mimpi"
                aria-label="Open Pohon Mimpi Message in a Bottle"
              >
                {/* Glowing Glass Bottle Icon */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md group-hover:bg-cyan-400/40 transition-all" />
                  <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 transition-transform group-hover:rotate-6 drop-shadow" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Cork Stopper */}
                    <rect x="10" y="1.5" width="4" height="2.8" rx="0.6" fill="#a06e42" stroke="#5a3d24" strokeWidth="0.8" />
                    {/* Bottle Neck & Body */}
                    <path d="M9.5 4.3H14.5V6.8C14.5 7.8 16 8.8 17.2 10.3C18.2 11.7 18.2 13.5 18.2 15.2C18.2 18.8 15.6 21.2 12 21.2C8.4 21.2 5.8 18.8 5.8 15.2C5.8 13.5 5.8 11.7 6.8 10.3C8 8.8 9.5 7.8 9.5 6.8V4.3Z" fill="rgba(56, 189, 248, 0.22)" stroke="#38bdf8" strokeWidth="1.2" strokeLinejoin="round" />
                    {/* Rolled parchment scroll inside */}
                    <rect x="10.2" y="10.8" width="3.6" height="7" rx="0.8" fill="#fde68a" stroke="#d97706" strokeWidth="0.7" transform="rotate(-8 12 14.3)" />
                    {/* Twine ribbon on scroll */}
                    <line x1="9.8" y1="14" x2="13.8" y2="13.5" stroke="#92400e" strokeWidth="0.8" />
                    {/* Starlight glint */}
                    <circle cx="14.2" cy="12.5" r="0.8" fill="#ffffff" />
                  </svg>
                </div>

                {/* Expanding Tooltip Label on Hover */}
                <div className="hidden sm:flex flex-col text-left pl-3 pr-1 max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-out">
                  <span className="text-xs font-bold text-white tracking-wide">Pohon Mimpi</span>
                  <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest">Message in a bottle</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Cinematic Floating Button */}
        <AnimatePresence>
          {!selectedArtwork && showUI && !portfolioActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-20 right-6 sm:bottom-28 sm:right-12 pointer-events-none z-[90]"
            >
              <button 
                onClick={onToggleCinematic} 
                className={`pointer-events-auto bg-black/60 hover:bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/10 text-white shadow-lg transition-all flex items-center justify-center group ${cinematicMode ? 'text-emerald-400 border-emerald-400/30' : ''}`} 
                aria-label="Toggle Cinematic Mode"
              >
                 <RotateCcw size={20} className={cinematicMode ? "animate-[spin_4s_linear_infinite]" : "group-hover:-rotate-45 transition-transform"} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Artwork Overlay */}
      <AnimatePresence>
        {selectedArtwork && (
          <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
            {/* Top Bar with Back Button */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="flex justify-between items-center"
            >
              <button 
                onClick={onBack}
                className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-lg border border-white/10 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 sm:gap-3 group w-fit"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="hidden sm:inline">Back to Universe</span>
                <span className="sm:hidden tracking-wider uppercase text-xs font-mono">Back</span>
              </button>
            </motion.div>

            {/* Desktop Center Navigation Arrows */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="hidden sm:flex absolute inset-0 items-center justify-between pointer-events-none px-8"
            >
              <button 
                onClick={onPrev} 
                className="pointer-events-auto bg-black/60 hover:bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/10 text-white shadow-lg transition-colors flex items-center justify-center group" 
                aria-label="Previous Artwork"
              >
                <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={onNext} 
                className="pointer-events-auto bg-black/60 hover:bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/10 text-white shadow-lg transition-colors flex items-center justify-center group mr-[calc(30vw+2rem)]" 
                aria-label="Next Artwork"
              >
                <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>

            {/* Profile Info Side Panel */}
            <div className="flex-1 flex items-center justify-end w-full">
              <motion.div 
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30, transition: { duration: 0.4 } }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} // smooth ease out
                className="pointer-events-auto w-full sm:w-[30vw] h-[75vh] bg-black/40 backdrop-blur-2xl border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
              >
                {/* Subtle sheen */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full overflow-hidden">
                  <div className="shrink-0 mb-3 flex items-center justify-between">
                    <p className="text-emerald-400/90 font-mono text-[10px] tracking-[0.2em] uppercase">
                      Viewing Selected Profile
                    </p>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={onPrev}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
                        aria-label="Previous Artwork"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button 
                        onClick={onNext}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
                        aria-label="Next Artwork"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <h2 className="text-3xl font-display font-bold tracking-tight text-white mb-1">
                      {selectedArtwork.title}
                    </h2>
                    <p className="text-gray-300 font-medium flex items-center gap-2 mb-6 text-sm">
                      by <span className="text-white font-semibold">{selectedArtwork.artist}</span>
                    </p>
                  </div>

                  <div className="flex flex-1 min-h-0 relative">
                    <div 
                      ref={scrollRef}
                      onScroll={handleScroll}
                      className="overflow-y-auto pr-4 pb-4 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <p className="text-gray-400 text-sm leading-relaxed font-sans whitespace-pre-line">
                        {selectedArtwork.description}
                      </p>
                    </div>
                    
                    {/* Custom Scroll Indicator */}
                    <div className="flex flex-col gap-1.5 ml-2 justify-center shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const isActive = Math.round(scrollProgress * 4) === i;
                        return (
                          <div 
                            key={i} 
                            onClick={() => {
                              if (scrollRef.current) {
                                const { scrollHeight, clientHeight } = scrollRef.current;
                                const maxScroll = scrollHeight - clientHeight;
                                scrollRef.current.scrollTo({
                                  top: (i / 4) * maxScroll,
                                  behavior: 'smooth'
                                });
                              }
                            }}
                            className={`w-1.5 rounded-full transition-all cursor-pointer duration-300 ${isActive ? 'h-5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'h-1.5 bg-white/20 hover:bg-white/40'}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-auto shrink-0">
                    <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 group">
                      <span>View Full Details</span>
                      <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
