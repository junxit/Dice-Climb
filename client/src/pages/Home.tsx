import { useState } from "react";
import { SetupScreen } from "@/components/game/SetupScreen";
import { Game } from "@/components/game/Game";
import { Player } from "@/components/game/PlayerPiece";

export default function HomePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const handleStartGame = (configuredPlayers: Player[]) => {
    setPlayers(configuredPlayers);
    setGameStarted(true);
  };

  const handleExitGame = () => {
    setGameStarted(false);
    setPlayers([]);
  };

  if (gameStarted) {
    return <Game initialPlayers={players} onExit={handleExitGame} />;
  }

  return <SetupScreen onStartGame={handleStartGame} />;
}
