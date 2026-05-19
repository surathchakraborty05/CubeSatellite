// components/HeatmapViewWrapper.tsx
import dynamic from 'next/dynamic';

const HeatmapView = dynamic(() => import('./HeatmapView'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-40 animate-pulse bg-black">
      {/* Fake map blocks */}
      <div className="w-full h-full relative overflow-hidden">
        
        {/* top glow */}
        <div className="absolute top-4 left-4 w-40 h-5 rounded bg-white/10" />

        {/* fake continents */}
        <div className="absolute top-[20%] left-[10%] w-32 h-20 rounded-full bg-white/5 blur-xl" />
        <div className="absolute top-[45%] right-[15%] w-40 h-24 rounded-full bg-white/5 blur-xl" />
        <div className="absolute bottom-[15%] left-[30%] w-28 h-16 rounded-full bg-white/5 blur-xl" />

        {/* shimmer */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full w-1/3 bg-white/10 skew-x-12 animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  ),
});

export default HeatmapView;