import { motion } from "framer-motion";
import { User, Smile, Ghost, Heart, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Player {
  id: number;
  name: string;
  color: string;
  avatar: string; // key for icon
  position: number;
  isTurn: boolean;
  score?: number; // for sorting turn order initially
}

interface PlayerPieceProps {
  player: Player;
  gridSize?: number;
}

export function PlayerPiece({ player, gridSize = 10 }: PlayerPieceProps) {
  // Map avatar string to component
  const getIcon = () => {
    switch (player.avatar) {
      case 'smile': return <Smile className="w-full h-full text-white" />;
      case 'ghost': return <Ghost className="w-full h-full text-white" />;
      case 'heart': return <Heart className="w-full h-full text-white" />;
      case 'star': return <Star className="w-full h-full text-white" />;
      case 'zap': return <Zap className="w-full h-full text-white" />;
      default: return <User className="w-full h-full text-white" />;
    }
  };

  return (
    <motion.div
      layoutId={`player-${player.id}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1, y: player.isTurn ? [0, -10, 0] : 0 }}
      transition={{ 
        y: { repeat: Infinity, duration: 1, ease: "easeInOut" } 
      }}
      className={cn(
        "relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10",
        player.color
      )}
    >
      <div className="w-[60%] h-[60%]">
        {getIcon()}
      </div>
      
      {/* Name tag on hover or always if active? */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {player.name}
      </div>
    </motion.div>
  );
}
