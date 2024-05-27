import React, { useEffect, useRef, useState } from 'react';

interface Player {
  x: number;
  y: number;
}

interface Bullet {
  x: number;
  y: number;
}

interface Enemy {
  x: number;
  y: number;
}

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player>({ x: 375, y: 500 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [score, setScore] = useState(0);

  const playerSpeed = 5;
  const bulletSpeed = 7;
  const enemySpeed = 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          setPlayer((prev) => ({ ...prev, x: Math.max(prev.x - playerSpeed, 0) }));
          break;
        case 'ArrowRight':
          setPlayer((prev) => ({ ...prev, x: Math.min(prev.x + playerSpeed, (canvas?.width || 800) - 50) }));
          break;
        case ' ':
          setBullets((prev) => [...prev, { x: player.x + 22.5, y: player.y }]);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    let animationFrameId: number;
    const render = () => {
      if (!context || !canvas) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw player
      context.fillStyle = 'blue';
      context.fillRect(player.x, player.y, 50, 50);

      // Draw bullets
      context.fillStyle = 'red';
      bullets.forEach((bullet) => {
        context.fillRect(bullet.x, bullet.y, 5, 10);
      });

      // Draw enemies
      context.fillStyle = 'green';
      enemies.forEach((enemy) => {
        context.fillRect(enemy.x, enemy.y, 50, 50);
      });

      // Update bullets
      setBullets((prev) =>
        prev.map((bullet) => ({ ...bullet, y: bullet.y - bulletSpeed })).filter((bullet) => bullet.y > 0)
      );

      // Update enemies
      setEnemies((prev) =>
        prev.map((enemy) => ({ ...enemy, y: enemy.y + enemySpeed })).filter((enemy) => enemy.y < (canvas?.height || 600))
      );

      // Check for collisions
      checkCollisions();

      animationFrameId = requestAnimationFrame(render);
    };

    const checkCollisions = () => {
      setBullets((prevBullets) =>
        prevBullets.filter((bullet) => {
          const hitEnemyIndex = enemies.findIndex(
            (enemy) => bullet.x >= enemy.x && bullet.x <= enemy.x + 50 && bullet.y <= enemy.y + 50 && bullet.y >= enemy.y
          );
          if (hitEnemyIndex !== -1) {
            setEnemies((prevEnemies) => prevEnemies.filter((_, index) => index !== hitEnemyIndex));
            setScore((prevScore) => prevScore + 100);
            return false;
          }
          return true;
        })
      );
    };

    const spawnEnemy = () => {
      const xPosition = Math.floor(Math.random() * ((canvas?.width || 800) - 50));
      setEnemies((prev) => [...prev, { x: xPosition, y: 0 }]);
    };

    const enemySpawnInterval = setInterval(spawnEnemy, 1000);

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(enemySpawnInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [player, bullets, enemies]);

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
      <div style={{ color: 'white', fontSize: '24px' }}>Score: {score}</div>
    </div>
  );
};

export default GameCanvas;
