export function PeacockFeather({ position = 'left', top = 200 }: { position?: 'left' | 'right'; top?: number }) {
  return (
    <div 
      className="peacock-feather"
      style={{
        [position]: 0,
        top: `${top}px`,
        transform: position === 'right' 
          ? 'rotate(-15deg) scaleX(-1)' 
          : 'rotate(15deg)'
      }}
    />
  );
}