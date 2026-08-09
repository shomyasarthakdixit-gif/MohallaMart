"use client";
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] sm:h-[400px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

export default MapPicker;
