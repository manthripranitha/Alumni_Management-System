import { useEffect, useState } from 'react';

export function CloudsAndBirds() {
  const [raindrops, setRaindrops] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  // Generate raindrops with random positions and animation durations
  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 40; i++) {
      drops.push({
        id: i,
        left: Math.random() * 100, // random position across the width (%)
        delay: Math.random() * 5, // random delay (s)
        duration: 2 + Math.random() * 3, // random duration (2-5s)
      });
    }
    setRaindrops(drops);
  }, []);

  return (
    <div className="relative cloud-container">
      {/* Clouds */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>
      
      {/* Raindrops */}
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="raindrop"
          style={{
            left: `${drop.left}%`,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
          }}
        ></div>
      ))}
      
      {/* Peacock Feathers instead of Birds */}
      <div className="peacock-feather-float peacock-feather-1"></div>
      <div className="peacock-feather-float peacock-feather-2"></div>
      <div className="peacock-feather-float peacock-feather-3"></div>
      <div className="peacock-feather-float peacock-feather-4"></div>
    </div>
  );
}