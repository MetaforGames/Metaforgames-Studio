import { Canvas } from '@react-three/fiber';
import { useState, Suspense, useEffect } from 'react';
import { Universe } from './components/Universe';
import { UI } from './components/UI';
import { PortfolioCarousel } from './components/PortfolioCarousel';
import { MessageInABottle } from './components/MessageInABottle';
import { artworks } from './data/artworks';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Heart, Coffee, X } from 'lucide-react';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [portfolioActive, setPortfolioActive] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [activePopup, setActivePopup] = useState<number>(0);
  const [isBottleOpen, setIsBottleOpen] = useState(false);
  const [introStage, setIntroStage] = useState<'loading' | 'flash' | 'done'>('loading');
  const [progress, setProgress] = useState(0);
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    if (introStage === 'loading') {
      let p = 0;
      let timeoutId: NodeJS.Timeout;

      const increment = () => {
        p += Math.floor(Math.random() * 36) + 6;
        if (p >= 100) {
          p = 100;
          setProgress(100);
          setTimeout(() => setIntroStage('flash'), 500);
        } else {
          setProgress(p);
          // Random delay between 50ms and 500ms to simulate lag
          timeoutId = setTimeout(increment, Math.random() * 450 + 50);
        }
      };
      
      timeoutId = setTimeout(increment, 500); // Initial delay
      return () => clearTimeout(timeoutId);
    } else if (introStage === 'flash') {
      setTimeout(() => {
        setIntroStage('done');
      }, 3000); 
    }
  }, [introStage]);

  useEffect(() => {
    if (introStage === 'done') {
      setShowUI(true);
      let isCancelled = false;
      
      const runSequence = async () => {
        await new Promise(r => setTimeout(r, 10000));
        if (isCancelled) return;
        setActivePopup(1);
        
        await new Promise(r => setTimeout(r, 20000));
        if (isCancelled) return;
        setActivePopup(0);
        
        await new Promise(r => setTimeout(r, 500));
        if (isCancelled) return;
        setActivePopup(2);
        
        await new Promise(r => setTimeout(r, 10000));
        if (isCancelled) return;
        setActivePopup(0);
      };
      
      runSequence();
      
      return () => { isCancelled = true; };
    }
  }, [introStage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBottleOpen) {
          setIsBottleOpen(false);
        } else if (cinematicMode) {
          setCinematicMode(false);
        } else if (portfolioActive) {
          setPortfolioActive(false);
        } else if (selectedId) {
          setSelectedId(null);
        }
      } else if (cinematicMode && e.key === ' ') {
        setCinematicMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [portfolioActive, selectedId, cinematicMode, isBottleOpen]);

  const handleNextArtwork = () => {
    if (!selectedId) return;
    const currentIndex = artworks.findIndex(a => a.id === selectedId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % artworks.length;
    setSelectedId(artworks[nextIndex].id);
  };

  const handlePrevArtwork = () => {
    if (!selectedId) return;
    const currentIndex = artworks.findIndex(a => a.id === selectedId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + artworks.length) % artworks.length;
    setSelectedId(artworks[prevIndex].id);
  };

  const selectedArtwork = selectedId 
    ? artworks.find(a => a.id === selectedId) || null 
    : null;

  useEffect(() => {
    if (cinematicMode) {
      document.body.style.cursor = 'none';
      document.body.classList.add('hide-cursor-global');
    } else {
      document.body.style.cursor = 'auto';
      document.body.classList.remove('hide-cursor-global');
    }
    return () => {
      document.body.style.cursor = 'auto';
      document.body.classList.remove('hide-cursor-global');
    };
  }, [cinematicMode]);

  return (
    <div className="w-full h-screen bg-[#050510] overflow-hidden relative font-sans text-white">
      <Canvas 
        camera={{ position: [0, 0, 500], fov: 45, far: 5000 }}
        dpr={[1, 2]} 
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Universe 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
            portfolioActive={portfolioActive} 
            cinematicMode={cinematicMode}
            introStage={introStage}
            progress={progress}
          />
          <PortfolioCarousel 
            active={portfolioActive} 
            onSelect={(id) => {
              setSelectedId(id);
              setPortfolioActive(false); 
            }} 
          />
        </Suspense>
      </Canvas>
      
      <UI 
        selectedArtwork={selectedArtwork}
        onBack={() => {
          setSelectedId(null);
          setPortfolioActive(false);
        }}
        portfolioActive={portfolioActive}
        onPortfolioClick={() => setPortfolioActive(prev => !prev)}
        cinematicMode={cinematicMode}
        onToggleCinematic={() => setCinematicMode(prev => !prev)}
        showUI={showUI}
        onNext={handleNextArtwork}
        onPrev={handlePrevArtwork}
        onOpenPohonMimpi={() => setIsBottleOpen(true)}
      />
      
      {/* Background click handler to close notification popups (1 & 2 only) */}
      {(activePopup === 1 || activePopup === 2) && !portfolioActive && !selectedArtwork && (
        <div 
          className="absolute inset-0 z-40 pointer-events-auto" 
          onClick={() => setActivePopup(0)} 
        />
      )}

      {/* Notifications Popups */}
      <AnimatePresence>
        {!portfolioActive && !selectedArtwork && (
          <div className="absolute z-50 bottom-6 right-6 md:bottom-12 md:right-12 flex flex-col gap-4 items-end pointer-events-none">
            {/* 1. Support & Lessons (Current) */}
            <AnimatePresence>
            {activePopup === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ delay: 0 }}
                className="bg-black/60 backdrop-blur-xl border border-emerald-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto relative"
              >
                <button 
                  onClick={() => setActivePopup(0)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
                <h3 className="text-xl font-display font-bold text-white mb-2">Build an app / website with us.</h3>
                <p className="text-sm text-gray-300 mb-6">Let's get you connected!</p>
                
                <div className="flex gap-4">
                   <a href="#" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors pt-4 pb-3 px-3 rounded-xl flex flex-col items-center justify-center gap-2 group">
                     <div className="flex gap-2">
                       <Heart className="text-[#FF424D] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" size={24} />
                       <Coffee className="text-[#00c5ff] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" size={24} />
                     </div>
                     <span className="text-[10px] font-mono uppercase tracking-wider text-white/70">Support</span>
                   </a>
                   <a href="#" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors pt-4 pb-3 px-3 rounded-xl flex flex-col items-center justify-center gap-2 group">
                     <GraduationCap className="text-[#A435F0] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" size={24} />
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-white/90 leading-tight">450K+</span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/70">Public Lesson</span>
                     </div>
                   </a>
                </div>
                <p className="text-[10px] text-gray-400 font-mono mt-5">
                  For any specific customization for your needs please email us on <a href="mailto:metaforgames@gmail.com" className="text-emerald-400 hover:text-emerald-300">metaforgames@gmail.com</a>
                </p>
              </motion.div>
            )}
            </AnimatePresence>

            {/* 2. Incubation Program */}
            <AnimatePresence>
            {activePopup === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ delay: 0 }}
                className="bg-black/60 backdrop-blur-xl border border-blue-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto relative"
              >
                <button 
                  onClick={() => setActivePopup(0)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
                <h3 className="text-xl font-display font-bold text-white mb-2">Our Incubation Program</h3>
                <p className="text-sm text-gray-300 mb-4">meet other likeminded hackers in tropical island life, network, hone your skill, leave Bali all geared up and ready for what comes next</p>
                
                <a href="#" className="block text-center w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-200 transition-colors py-2 px-4 rounded-lg text-sm font-bold tracking-wide">
                  View Bali Bootcamp Itinerary
                </a>
              </motion.div>
            )}
            </AnimatePresence>

          </div>
        )}
      </AnimatePresence>

      {/* Message In A Bottle: Pohon Mimpi Partner Notebook Modal (Centered, user-initiated) */}
      <AnimatePresence>
        {isBottleOpen && (
          <MessageInABottle 
            isOpen={isBottleOpen} 
            onClose={() => setIsBottleOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Loading Sequence Overlay */}
      <AnimatePresence>
        {introStage === 'loading' && (
          <motion.div 
            key="loading"
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none font-mono select-none bg-transparent"
          >
            <div className="w-64 border-2 border-white p-1">
               <div className="h-2 w-full relative overflow-hidden">
                 <div 
                   className="absolute top-0 left-0 h-full bg-white transition-all duration-150"
                   style={{ width: `${progress}%` }}
                 />
               </div>
            </div>
            <div className="mt-3 text-white text-xs uppercase tracking-[0.2em]">Loading {progress}%</div>
          </motion.div>
        )}
        
        {introStage === 'flash' && (
          <motion.div 
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backgroundColor: '#ffffff' }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeOut" } }}
            className="absolute inset-0 z-[90] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

