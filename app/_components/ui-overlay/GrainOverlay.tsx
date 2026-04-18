"use client";

// Defining Props interface for custom settings
interface GrainOverlayProps {
  opacity?: number;
  speed?: string;
  smooth?: boolean;
}

export default function GrainOverlay({
  opacity = 0.2,
  speed = "1.3s",
  smooth = false,
}: GrainOverlayProps) {
  return (
    <div
      className="grain pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-multiply"
      style={{ opacity: opacity }}
    >
      <style>{`
        @keyframes film-scratch-anim {
          0%, 100% { transform: translate3d(0, 0, 0); }
          10% { transform: translate3d(-5%, -10%, 0); }
          20% { transform: translate3d(-15%, 5%, 0); }
          30% { transform: translate3d(7%, -25%, 0); }
          40% { transform: translate3d(-5%, 25%, 0); }
          50% { transform: translate3d(-15%, 10%, 0); }
          60% { transform: translate3d(15%, 0, 0); }
          70% { transform: translate3d(0, 15%, 0); }
          80% { transform: translate3d(3%, 35%, 0); }
          90% { transform: translate3d(-10%, 10%, 0); }
        }
        
        .grain-overflow {
          /* Put a transparent PNG with black specks here */
          background-image: url('/noise.png');
          background-repeat: repeat;
          background-size: 300px;
          /* Toggling between steps(1) for jumping effect and linear for smooth sliding */
          animation: film-scratch-anim ${speed} ${smooth ? "linear" : "steps(1)"} infinite;
        }
      `}</style>
      
      <div className="grain-overflow absolute -inset-[200%] h-[400%] w-[400%]"></div>
    </div>
  );
}
