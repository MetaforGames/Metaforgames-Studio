import { merchImageBase64 } from './merch_image';
import { candyImageBase64 } from './candy_life_image';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  features: string[];
  description: string;
  imageUrl: string;
  position: [number, number, number]; // [x, y, z] in 3D space
  category?: string;
  purpose?: string;
  isContributionPrompt?: boolean;
}

export const artworks: Artwork[] = [
  {
    id: 'art-1',
    title: 'Building Smarter Workflows',
    artist: 'System Ops',
    features: [
      'Internal Systems & Automation',
      'Custom Dashboards & Tools',
      'Optimizing Business Processes'
    ],
    description: 'We develop custom internal systems, dashboards, and automated tools to optimize your business processes and streamline daily operations.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    position: [10, 2, -5],
  },
  {
    id: 'art-2',
    title: 'Pixel & Low Poly Worlds',
    artist: 'Game Dev',
    features: [
      'Pixel Art & 3D Models',
      'Game Assets & Environments',
      'Character Design'
    ],
    description: 'Our team specializes in crafting detailed pixel art, 3D models, environments, and character designs that bring your gaming worlds into stunning reality.',
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800',
    position: [-8, 6, 8],
  },
  {
    id: 'art-3',
    title: 'Stories That Live Online',
    artist: 'Narrative',
    features: [
      'Interactive Visual Novels',
      'Engaging Narratives',
      'Immersive Storytelling'
    ],
    description: 'We craft immersive visual novels and interactive storytelling experiences with engaging narratives that captivate online audiences.',
    imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=800',
    position: [0, -8, 12],
  },
  {
    id: 'art-4',
    title: 'Connecting Players Everywhere',
    artist: 'Multiplayer',
    features: [
      'Multiplayer Game Development',
      'Online Co-Op & PvP',
      'Matchmaking & Networking'
    ],
    description: 'Robust multiplayer game development including online Co-Op, PvP, matchmaking, and networking services to connect players continuously.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    position: [15, -4, 2],
  },
  {
    id: 'art-5',
    title: 'From Concept to Shelf',
    artist: 'Pohon Mimpi',
    features: [
      'Sustainable T-Shirts & Packaging',
      'Social Media Posts & Reels',
      'Advertising Photos Proven to Work'
    ],
    description: 'Sustainable Options: All merch and packaging (T-shirts, bottles, food-grade containers) start with eco-friendly materials — recycled cotton, biodegradable plastics, and FSC-certified paper.\n\nFlexible Pricing: Tiered pricing based on quantity, allowing startups and larger brands to access affordable rates.\n\nCreative Integration:\n• Social media assets (posts, carousels, reels)\n• Copywriting for product listings and ads\n• Proven ad photo compositions that drive conversions\n\nCollaborative Workflow: Pohon Mimpi handles sustainable sourcing and production; your agency manages branding, storytelling, and digital rollout.',
    imageUrl: merchImageBase64,
    position: [-12, -5, -6],
  },
  {
    id: 'art-6',
    title: 'Design for Candy Life',
    artist: 'Metaforgames Studios',
    features: [
      'Casual Game',
      'Cozy Life Simulation',
      'Tower Defense'
    ],
    description: '• Casual, cozy life simulation game with a twist of tower defense.\n• Players wake up on a mysterious candy-themed island with memories from their previous life.\n• Adapt to a world made entirely of sweets.\n• Build a home and interact with candy-themed villagers.\n• Defend your sugary paradise from creatures of the sea with candy-themed turrets.',
    imageUrl: candyImageBase64,
    position: [5, 10, -8],
  },
];
