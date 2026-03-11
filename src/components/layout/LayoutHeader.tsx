'use client';

import React from 'react';

export default React.memo(function LayoutHeader() {
    return (
        <header className="flex flex-wrap items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-[#262522] border-b border-white/5 shrink-0 z-10 w-full">
            <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl">♟️</span>
                <span className="text-lg md:text-xl font-extrabold text-[#e8e6e3] tracking-tight max-sm:hidden">
                    Chess <span className="text-[#81b64c]">Max</span>
                </span>
            </div>
        </header>
    );
});
