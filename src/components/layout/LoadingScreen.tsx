'use client';

export default function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 p-12">
            <div className="relative flex items-center justify-center">
                {/* Spinning glow ring */}
                <div className="absolute size-20 animate-[spin_3s_linear_infinite] rounded-full border-2 border-transparent border-t-accent-green/60 border-b-accent-green/60" />
                <div className="absolute size-16 animate-[spin_2s_linear_infinite_reverse] rounded-full border-2 border-transparent border-r-accent-green/40 border-l-accent-green/40" />
                
                {/* Center piece */}
                <div className="text-5xl text-accent-green animate-pulse drop-shadow-[0_0_15px_rgba(129,182,76,0.5)]">
                    ♞
                </div>
            </div>
            <div className="text-lg font-medium tracking-wide text-text-secondary animate-pulse">
                Warming up the engine...
            </div>
        </div>
    );
}
