import { cn } from "@/lib/utils";
import { Player, PlayerPiece } from "./PlayerPiece";
import boardBg from "@assets/generated_images/a_playful,_seamless_jungle_grass_pattern_for_a_game_board_background.png";

export interface SnakeOrLadder {
  start: number;
  end: number;
  type: 'snake' | 'ladder';
}

// Standard Snakes and Ladders Setup
export const SPECIAL_SPOTS: SnakeOrLadder[] = [
  // Ladders (Up)
  { start: 1, end: 38, type: 'ladder' },
  { start: 4, end: 14, type: 'ladder' },
  { start: 9, end: 31, type: 'ladder' },
  { start: 21, end: 42, type: 'ladder' },
  { start: 28, end: 84, type: 'ladder' },
  { start: 36, end: 44, type: 'ladder' },
  { start: 51, end: 67, type: 'ladder' },
  { start: 71, end: 91, type: 'ladder' },
  { start: 80, end: 100, type: 'ladder' },
  
  // Snakes (Down)
  { start: 16, end: 6, type: 'snake' },
  { start: 47, end: 26, type: 'snake' },
  { start: 49, end: 11, type: 'snake' },
  { start: 56, end: 53, type: 'snake' },
  { start: 62, end: 19, type: 'snake' },
  { start: 64, end: 60, type: 'snake' },
  { start: 87, end: 24, type: 'snake' },
  { start: 93, end: 73, type: 'snake' },
  { start: 95, end: 75, type: 'snake' },
  { start: 98, end: 78, type: 'snake' },
];

interface BoardProps {
  players: Player[];
  activePlayerId: number;
}

export function Board({ players, activePlayerId }: BoardProps) {
  // Generate numbers 100 to 1 in zig-zag
  const getCellNumber = (row: number, col: number) => {
    // row is 0-9 (top to bottom visually, so row 0 is actually numbers 91-100)
    // Actually standard board has 1 at bottom left. 
    // Let's think in standard Cartesian for calculation then map to grid.
    // CSS Grid: Row 1 is top.
    // So Row 1 = 91-100.
    // Row 10 = 1-10.
    
    const visualRow = 9 - row; // 0 at bottom, 9 at top
    
    if (visualRow % 2 === 0) {
      // Even row (0, 2, 4...) -> Left to Right (1-10, 21-30)
      return (visualRow * 10) + (col + 1);
    } else {
      // Odd row (1, 3, 5...) -> Right to Left (20-11, 40-31)
      return (visualRow * 10) + (10 - col);
    }
  };

  const cells = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      cells.push({ row: r, col: c, number: getCellNumber(r, c) });
    }
  }

  // Helper to get center coordinates (%) of a cell number for SVG lines
  const getCellCenter = (num: number) => {
    // 1-100
    // Visual Row from bottom (0-9)
    const rowFromBottom = Math.floor((num - 1) / 10); 
    const isEvenRow = rowFromBottom % 2 === 0;
    
    const colIndex = (num - 1) % 10; // 0-9
    
    // If even row (0, 2...), left to right (0,1,2...)
    // If odd row (1, 3...), right to left (9,8,7...)
    const actualCol = isEvenRow ? colIndex : (9 - colIndex);
    
    // Map to percentage
    // x: (actualCol * 10) + 5
    // y: ((9 - rowFromBottom) * 10) + 5  <-- because CSS grid row 0 is top
    
    return {
      x: (actualCol * 10) + 5,
      y: ((9 - rowFromBottom) * 10) + 5
    };
  };

  return (
    <div className="relative aspect-square w-full max-w-[600px] mx-auto bg-emerald-50 rounded-lg shadow-2xl overflow-hidden border-8 border-amber-800/20">
      
      {/* Background Texture */}
      <div 
        className="absolute inset-0 opacity-40 z-0" 
        style={{ backgroundImage: `url(${boardBg})`, backgroundSize: '200px' }}
      />

      {/* Grid Container */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 z-10">
        {cells.map((cell) => (
          <div 
            key={cell.number} 
            className={cn(
              "relative border-[0.5px] border-black/5 flex items-start justify-start p-[2px] sm:p-1",
              cell.number % 2 === 0 ? "bg-white/10" : "bg-black/5"
            )}
          >
            <span className={cn(
              "text-[8px] sm:text-[10px] font-bold opacity-50",
              SPECIAL_SPOTS.some(s => s.start === cell.number) && "text-blue-600 opacity-100 scale-110",
              SPECIAL_SPOTS.some(s => s.end === cell.number) && "text-red-600 opacity-100 scale-110"
            )}>
              {cell.number}
            </span>
          </div>
        ))}
      </div>

      {/* Snakes and Ladders SVG Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ladderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="50%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodOpacity="0.3" />
          </filter>
        </defs>

        {SPECIAL_SPOTS.map((spot, i) => {
          const start = getCellCenter(spot.start);
          const end = getCellCenter(spot.end);
          
          if (spot.type === 'ladder') {
             // Simple ladder visualization
            return (
              <g key={`ladder-${i}`} filter="url(#shadow)">
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="url(#ladderGradient)" strokeWidth="1.5" strokeLinecap="round" />
                {/* Rungs - approximated */}
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#DEB887" strokeWidth="0.8" strokeDasharray="1 1" strokeLinecap="round" />
              </g>
            );
          } else {
            // Snake visualization (Bezier curve)
            // Control points to make it wavy
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const curve = 5; // waviness scaled for 100x100 viewBox
            
            // Randomize curve direction slightly based on index
            const dir = i % 2 === 0 ? 1 : -1;

            return (
              <g key={`snake-${i}`} filter="url(#shadow)">
                <path 
                  d={`M ${start.x} ${start.y} Q ${midX + (curve * dir)} ${midY} ${end.x} ${end.y}`}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path 
                  d={`M ${start.x} ${start.y} Q ${midX + (curve * dir)} ${midY} ${end.x} ${end.y}`}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  strokeDasharray="0.5 0.5"
                />
                {/* Snake Head at Start (Top) */}
                <circle cx={start.x} cy={start.y} r="0.4" fill="#22c55e" />
                <circle cx={start.x} cy={start.y} r="0.15" fill="black" transform={`translate(-0.2, -0.2)`} />
                <circle cx={start.x} cy={start.y} r="0.15" fill="black" transform={`translate(0.2, -0.2)`} />
              </g>
            );
          }
        })}
      </svg>

      {/* Players Layer */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {players.map((player) => {
          const pos = getCellCenter(player.position);
          
          // Offset players slightly if they are on the same square
          const playersOnSameSquare = players.filter(p => p.position === player.position);
          const indexOnSquare = playersOnSameSquare.findIndex(p => p.id === player.id);
          
          let offsetX = 0;
          let offsetY = 0;
          
          if (playersOnSameSquare.length > 1) {
             const angle = (indexOnSquare / playersOnSameSquare.length) * 2 * Math.PI;
             offsetX = Math.cos(angle) * 2; // 2% offset
             offsetY = Math.sin(angle) * 2;
          }

          return (
            <div 
              key={player.id}
              className="absolute transition-all duration-500 ease-in-out"
              style={{ 
                left: `${pos.x + offsetX}%`, 
                top: `${pos.y + offsetY}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: player.isTurn ? 50 : 30
              }}
            >
              <PlayerPiece player={player} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
