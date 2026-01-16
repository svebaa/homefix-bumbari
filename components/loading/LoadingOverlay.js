"use client";

import { Hammer } from "lucide-react";

export default function LoadingOverlay({ open }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="relative flex items-center gap-6">
        {/* Čekić */}
        <Hammer
          size={100}
          strokeWidth={2.5}
          className="text-white hammer"
          aria-hidden="true"
        />

        {/* Tri točkice */}
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
      </div>

      <style jsx>{`
        /* HAMMER */
        .hammer {
          transform-origin: 75% 75%;
          animation: hammer-hit 0.9s ease-in-out infinite;
        }

        @keyframes hammer-hit {
          0% {
            transform: rotate(-35deg);
          }
          35% {
            transform: rotate(20deg);
          }
          45% {
            transform: rotate(10deg);
          }
          100% {
            transform: rotate(-35deg);
          }
        }

        /* DOTS */
        .dots {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .dots span {
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background: white;
          opacity: 0.25;
          animation: dot-pulse 0.9s infinite;
        }

        .dots span:nth-child(1) {
          animation-delay: 0.35s;
        }
        .dots span:nth-child(2) {
          animation-delay: 0.45s;
        }
        .dots span:nth-child(3) {
          animation-delay: 0.55s;
        }

        @keyframes dot-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.25;
          }
          40% {
            transform: scale(1.3);
            opacity: 1;
          }
          80% {
            transform: scale(0.9);
            opacity: 0.35;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}
