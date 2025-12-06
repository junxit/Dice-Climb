import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dice } from "./Dice";
import { Board, SPECIAL_SPOTS } from "./Board";
import { Player } from "./PlayerPiece";
import { ArrowRight, Trophy, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface GameProps {
  initialPlayers: Player[];
  onExit: () => void;
}

type GamePhase = 'decide-order' | 'playing' | 'finished';

export function Game({ initialPlayers, onExit }: GameProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [phase, setPhase] = useState<GamePhase>('decide-order');
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Roll to decide who goes first!");
  const { toast } = useToast();

  // Initial Order Decision Logic
  const [orderRolls, setOrderRolls] = useState<{playerId: number, roll: number}[]>([]);

  const currentPlayer = players[activePlayerIndex];

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    
    // Simulate roll duration
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      setIsRolling(false);
      handleRollComplete(roll);
    }, 1000);
  };

  const handleRollComplete = (roll: number) => {
    if (phase === 'decide-order') {
      handleDecideOrderRoll(roll);
    } else if (phase === 'playing') {
      handleGameRoll(roll);
    }
  };

  const handleDecideOrderRoll = (roll: number) => {
    const newRolls = [...orderRolls, { playerId: currentPlayer.id, roll }];
    setOrderRolls(newRolls);
    
    toast({
      title: `${currentPlayer.name} rolled a ${roll}!`,
      duration: 1500,
    });

    if (newRolls.length < players.length) {
      // Next player rolls for order
      setActivePlayerIndex((prev) => prev + 1);
    } else {
      // All rolled, sort and start
      setTimeout(() => {
        const sortedRolls = [...newRolls].sort((a, b) => b.roll - a.roll);
        const sortedPlayers = sortedRolls.map(r => players.find(p => p.id === r.playerId)!);
        
        // Handle ties (simple version: first to roll high stays high)
        // In a real strict game we'd reroll ties, but for kids simplified is better.
        
        setPlayers(sortedPlayers.map((p, i) => ({ ...p, isTurn: i === 0 })));
        setPhase('playing');
        setActivePlayerIndex(0);
        setStatusMessage(`${sortedPlayers[0].name} starts the game!`);
        
        toast({
          title: "Order Decided!",
          description: `${sortedPlayers[0].name} rolled the highest (${sortedRolls[0].roll}) and goes first.`,
        });
      }, 1500);
    }
  };

  const handleGameRoll = (roll: number) => {
    if (phase !== 'playing') return;

    let newPosition = currentPlayer.position + roll;

    // Bounce back if over 100? Or just stay? 
    // Standard rule: Must land exactly on 100. If roll is 5 and need 3, you bounce back 2.
    // Simplified for kids: Just stop at 100 (or bounce). Let's do bounce for fun.
    if (newPosition > 100) {
      const excess = newPosition - 100;
      newPosition = 100 - excess;
    }

    // Move player logic
    updatePlayerPosition(activePlayerIndex, newPosition, () => {
      // Check for win
      if (newPosition === 100) {
        handleWin();
        return;
      }

      // Check for Snakes or Ladders
      const special = SPECIAL_SPOTS.find(s => s.start === newPosition);
      if (special) {
        setTimeout(() => {
          const type = special.type === 'snake' ? "Oh no! A Snake! 🐍" : "Yay! A Ladder! 🪜";
          toast({
            title: type,
            description: special.type === 'snake' ? "Sliding down..." : "Climbing up!",
            variant: special.type === 'snake' ? "destructive" : "default",
          });
          
          updatePlayerPosition(activePlayerIndex, special.end, () => {
             endTurn(roll);
          });
        }, 800);
      } else {
        endTurn(roll);
      }
    });
  };

  const updatePlayerPosition = (index: number, pos: number, callback?: () => void) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], position: pos };
    setPlayers(newPlayers);
    
    // Allow animation to complete before callback
    if (callback) setTimeout(callback, 500);
  };

  const endTurn = (lastRoll: number) => {
    // If rolled a 6, get another turn? Standard rule.
    if (lastRoll === 6) {
      setStatusMessage(`${currentPlayer.name} rolled a 6! Roll again!`);
      toast({ title: "Bonus Turn!", description: "Rolling a 6 gives you another go!" });
      return; // Keep active player index same
    }

    const nextIndex = (activePlayerIndex + 1) % players.length;
    
    // Update isTurn flags
    const updatedPlayers = players.map((p, i) => ({
      ...p,
      isTurn: i === nextIndex
    }));
    setPlayers(updatedPlayers);
    
    setActivePlayerIndex(nextIndex);
    setStatusMessage(`${updatedPlayers[nextIndex].name}'s turn!`);
  };

  const handleWin = () => {
    setPhase('finished');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    setStatusMessage(`${currentPlayer.name} WINS! 🎉`);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col lg:flex-row gap-8 items-center justify-center max-w-7xl mx-auto">
      
      {/* Left Column: Game Board */}
      <div className="flex-1 w-full max-w-[600px] order-2 lg:order-1">
        <Board players={players} activePlayerId={currentPlayer.id} />
      </div>

      {/* Right Column: Controls & Stats */}
      <div className="w-full lg:w-[350px] flex flex-col gap-6 order-1 lg:order-2">
        
        {/* Status Card */}
        <Card className="p-6 game-card text-center bg-white/90">
          <h2 className="text-2xl font-display text-primary mb-2">
            {phase === 'decide-order' ? "Deciding Order" : phase === 'finished' ? "Game Over!" : "Current Turn"}
          </h2>
          <p className="text-lg font-medium text-slate-600 mb-4 animate-pulse">
            {statusMessage}
          </p>
          
          {phase !== 'finished' && (
            <div className="flex flex-col items-center justify-center gap-4 py-4 bg-slate-50 rounded-xl border border-slate-100">
              <Dice 
                value={diceValue} 
                rolling={isRolling} 
                size="lg"
                className="shadow-xl"
              />
              <Button 
                size="lg" 
                onClick={handleRoll} 
                disabled={isRolling}
                className={cn(
                  "w-full max-w-[200px] text-xl h-14 rounded-xl game-btn font-display tracking-widest",
                  currentPlayer.color.replace('bg-', 'bg-').replace('500', '600'),
                  "hover:brightness-110 text-white"
                )}
              >
                {isRolling ? "Rolling..." : "ROLL DICE"}
              </Button>
            </div>
          )}

          {phase === 'finished' && (
             <Button onClick={onExit} className="mt-4 w-full" size="lg" variant="outline">
               <RefreshCcw className="mr-2 h-4 w-4" /> Play Again
             </Button>
          )}
        </Card>

        {/* Players List */}
        <Card className="p-4 bg-white/80 border-2 border-white/50 backdrop-blur-sm shadow-sm rounded-2xl">
          <h3 className="font-display text-lg mb-3 px-2 text-slate-500 uppercase tracking-widest text-xs">Players</h3>
          <div className="space-y-3">
            {players.map((p, i) => (
              <div 
                key={p.id} 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border-2",
                  activePlayerIndex === i && phase !== 'finished'
                    ? "bg-white border-primary shadow-md scale-105 z-10" 
                    : "bg-transparent border-transparent opacity-80"
                )}
              >
                <div className={cn("w-3 h-3 rounded-full", p.color)} />
                <div className="flex-1 font-bold text-slate-700 flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-slate-400 font-mono text-sm">#{p.position}</span>
                </div>
                {activePlayerIndex === i && phase !== 'finished' && (
                  <ArrowRight className="text-primary animate-pulse" size={16} />
                )}
                {p.position === 100 && <Trophy className="text-yellow-500" />}
                
                {phase === 'decide-order' && orderRolls.find(r => r.playerId === p.id) && (
                   <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">
                     Rolled: {orderRolls.find(r => r.playerId === p.id)?.roll}
                   </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
