import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Smile, Ghost, Heart, Star, Zap, Plus, X, Play } from "lucide-react";
import { Player } from "./PlayerPiece";
import { cn } from "@/lib/utils";

interface SetupScreenProps {
  onStartGame: (players: Player[]) => void;
}

const AVATARS = [
  { id: 'smile', icon: Smile, label: 'Happy' },
  { id: 'ghost', icon: Ghost, label: 'Spooky' },
  { id: 'heart', icon: Heart, label: 'Lovely' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'zap', icon: Zap, label: 'Speedy' },
];

const COLORS = [
  { id: 'bg-red-500', value: 'red' },
  { id: 'bg-blue-500', value: 'blue' },
  { id: 'bg-green-500', value: 'green' },
  { id: 'bg-yellow-500', value: 'yellow' },
  { id: 'bg-purple-500', value: 'purple' },
  { id: 'bg-orange-500', value: 'orange' },
];

export function SetupScreen({ onStartGame }: SetupScreenProps) {
  const [players, setPlayers] = useState<Partial<Player>[]>([
    { id: 1, name: "Player 1", avatar: 'smile', color: 'bg-blue-500' },
    { id: 2, name: "Player 2", avatar: 'heart', color: 'bg-red-500' }
  ]);

  const addPlayer = () => {
    if (players.length < 4) {
      const nextId = players.length + 1;
      setPlayers([...players, { 
        id: nextId, 
        name: `Player ${nextId}`, 
        avatar: AVATARS[nextId % AVATARS.length].id, 
        color: COLORS[nextId % COLORS.length].id 
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      const newPlayers = [...players];
      newPlayers.splice(index, 1);
      setPlayers(newPlayers);
    }
  };

  const updatePlayer = (index: number, field: keyof Player, value: any) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    const finalPlayers = players.map(p => ({
      ...p,
      position: 1,
      isTurn: false,
      score: 0
    })) as Player[];
    onStartGame(finalPlayers);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 md:p-8 game-card animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl text-primary mb-2 text-shadow">Jungle Jump!</h1>
          <p className="text-muted-foreground text-lg">Snakes & Ladders Adventure</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-700">Who is playing?</h2>
            <div className="text-sm text-muted-foreground">{players.length}/4 Players</div>
          </div>

          <div className="grid gap-4">
            {players.map((player, index) => (
              <motion.div 
                key={player.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border-2 border-slate-100"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      value={player.name} 
                      onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      className="font-bold text-lg border-transparent hover:border-input focus:border-input bg-transparent"
                      placeholder="Name"
                    />
                  </div>
                  <div className="flex gap-2 items-center pl-3">
                    {/* Color Picker */}
                    <div className="flex gap-1">
                      {COLORS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => updatePlayer(index, 'color', c.id)}
                          className={cn(
                            "w-6 h-6 rounded-full transition-transform hover:scale-110",
                            c.id,
                            player.color === c.id ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "opacity-70"
                          )}
                        />
                      ))}
                    </div>
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    {/* Avatar Picker */}
                    <div className="flex gap-1">
                      {AVATARS.map(a => {
                        const Icon = a.icon;
                        return (
                          <button
                            key={a.id}
                            onClick={() => updatePlayer(index, 'avatar', a.id)}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              player.avatar === a.id ? "bg-white shadow-sm ring-2 ring-offset-1 ring-primary text-primary" : "text-slate-400 hover:bg-white/50"
                            )}
                          >
                            <Icon size={18} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {players.length > 2 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removePlayer(index)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X size={20} />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {players.length < 4 && (
            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5"
              onClick={addPlayer}
            >
              <Plus className="mr-2" /> Add Player
            </Button>
          )}

          <div className="pt-4 flex justify-center">
            <Button 
              size="lg" 
              className="w-full md:w-auto px-12 py-6 text-xl rounded-full game-btn bg-primary hover:bg-primary/90 text-white font-display"
              onClick={handleStartGame}
            >
              Start Adventure <Play className="ml-2 fill-current" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
