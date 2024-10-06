// pages/index.js
import SolarSystem from "@/components/SolarSystem";

const OrbitMap = () => {
  return (
    <div className="min-h-screen bg-neutral-800 p-6">
      {/* Title styled with Tailwind CSS */}
      <h1 className="text-4xl font-bold text-neutral-200 mb-8">Orbit Map</h1>

      {/* Solar System Component */}
      <div className="bg-neutral-900 border border-neutral-500 p-4 rounded-md">
        <SolarSystem />
      </div>
    </div>
  );
};

export default OrbitMap;
