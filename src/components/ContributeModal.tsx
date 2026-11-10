import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Artwork } from '../data/artworks';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArtwork: (artwork: Artwork) => void;
}

const PRESET_IMAGES = [
  {
    label: '2D Pixel Adventure',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Low Poly Island',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Retro Hybrid 3D',
    url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Digital System & Code',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
  },
];

const PURPOSES = [
  'Building prototype',
  'Helping a school project',
  'Game jam',
  'Joining a commercial team',
];

const CATEGORIES = [
  '2D Pixel Worlds',
  'Low Poly Worlds',
  'Pixel Poly Worlds',
  'Digitalization & Websites',
];

export function ContributeModal({ isOpen, onClose, onAddArtwork }: ContributeModalProps) {
  const [projectName, setProjectName] = useState('');
  const [creator, setCreator] = useState('');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [feature1, setFeature1] = useState('');
  const [feature2, setFeature2] = useState('');
  const [feature3, setFeature3] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !creator.trim()) return;

    const imgUrl = customImageUrl.trim() ? customImageUrl.trim() : selectedImage;
    const featuresList = [feature1, feature2, feature3]
      .map(f => f.trim())
      .filter(Boolean);

    if (featuresList.length === 0) {
      featuresList.push(`${purpose}`, `${category}`, 'Custom Contributed Project');
    }

    const newArtwork: Artwork = {
      id: `custom-art-${Date.now()}`,
      title: projectName.trim(),
      artist: creator.trim(),
      category: category,
      purpose: purpose,
      features: featuresList,
      description: description.trim() || `Project: ${projectName}\nCreator: ${creator}\nPurpose: ${purpose}\nCategory: ${category}\n\nConcept recorded from start to finish.`,
      imageUrl: imgUrl,
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      ],
    };

    onAddArtwork(newArtwork);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      // Reset fields
      setProjectName('');
      setCreator('');
      setDescription('');
      setFeature1('');
      setFeature2('');
      setFeature3('');
      setCustomImageUrl('');
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md pointer-events-auto overflow-y-auto"
        onClick={onClose}
        id="contribute-modal-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0e0e14] border border-white/10 rounded-2xl w-full max-w-2xl text-white shadow-2xl overflow-hidden relative my-8"
          id="contribute-modal-container"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold tracking-tight text-white">
                  Add Artwork or Contributed Project
                </h2>
                <p className="text-xs text-gray-400 font-sans">
                  Record your concept, art, or game contribution into our interactive universe
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close dialog"
              id="close-contribute-modal-btn"
            >
              <X size={20} />
            </button>
          </div>

          {success ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
              <CheckCircle2 size={48} className="text-emerald-400 animate-bounce" />
              <h3 className="text-2xl font-bold font-display text-white">Project Added!</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                "{projectName}" has been registered into the portfolio carousel and 3D universe.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Project Name & Creator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="project-name-input" className="block text-xs font-mono tracking-wider uppercase text-gray-300 mb-1.5">
                    Project Name *
                  </label>
                  <input
                    id="project-name-input"
                    type="text"
                    required
                    placeholder="e.g. Neon Spire, Candy Island"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="project-creator-input" className="block text-xs font-mono tracking-wider uppercase text-gray-300 mb-1.5">
                    Creator / Team *
                  </label>
                  <input
                    id="project-creator-input"
                    type="text"
                    required
                    placeholder="e.g. Your name, studio, or team"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-gray-300 mb-2">
                  What is the Purpose of this Project? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PURPOSES.map((p) => {
                    const isSelected = purpose === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPurpose(p)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                        id={`purpose-btn-${p.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <span className="leading-snug">{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-gray-300 mb-2">
                  Category / Style *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400/80 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                        id={`category-btn-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Asset / Image Selection */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-gray-300 mb-2">
                  Select Visual Style or Provide Image URL
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {PRESET_IMAGES.map((img) => {
                    const isSelected = !customImageUrl.trim() && selectedImage === img.url;
                    return (
                      <button
                        key={img.label}
                        type="button"
                        onClick={() => {
                          setSelectedImage(img.url);
                          setCustomImageUrl('');
                        }}
                        className={`relative rounded-xl overflow-hidden border aspect-[4/3] group transition-all ${
                          isSelected
                            ? 'ring-2 ring-emerald-400 border-transparent shadow-lg'
                            : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                          <span className="text-[10px] font-medium text-white leading-tight">{img.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400">
                    <ImageIcon size={16} />
                  </div>
                  <input
                    type="url"
                    placeholder="Or paste a custom image URL (e.g. https://...)"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              {/* Concept & Description */}
              <div>
                <label htmlFor="project-desc-input" className="block text-xs font-mono tracking-wider uppercase text-gray-300 mb-1.5">
                  Concept from Start to Finish (Story & Description)
                </label>
                <textarea
                  id="project-desc-input"
                  rows={3}
                  placeholder="Record your concept from start to finish: What inspired it? What are the key mechanics, tools, or workflows?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-none"
                />
              </div>

              {/* Key Features (Optional 3 points) */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-gray-300 mb-1.5">
                  Key Highlights / Features (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Feature 1 (e.g. Retro sprite sheet)"
                    value={feature1}
                    onChange={(e) => setFeature1(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="text"
                    placeholder="Feature 2 (e.g. Built for 72hr jam)"
                    value={feature2}
                    onChange={(e) => setFeature2(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="text"
                    placeholder="Feature 3 (e.g. Playable prototype)"
                    value={feature3}
                    onChange={(e) => setFeature3(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-mono tracking-wider uppercase text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  id="cancel-contribute-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                  id="submit-contribute-btn"
                >
                  <Plus size={16} />
                  <span>Add to Portfolio</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
