import Card from "@/components/card";
import Image from "next/image";

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default async function Home() {
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + 7);

  const nasaAPIData = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formatDate(now)}&end_date=${formatDate(end)}&api_key=${process.env.NASA_API_KEY}`, { next: { revalidate: 3600 }}).then((data) => data.json());

  const potentialHazard = Object.keys(nasaAPIData.near_earth_objects).map((date) => {
    return nasaAPIData.near_earth_objects[date].filter(i => i.is_potentially_hazardous_asteroid).length
  }).reduce((prev, curr) => prev + curr);

  const potentialColl = Object.keys(nasaAPIData.near_earth_objects).map((date) => {
    return nasaAPIData.near_earth_objects[date].filter(i => i.is_sentry_object).length
  }).reduce((prev, curr) => prev + curr);

  const allUpcomingDates = Object.values(nasaAPIData.near_earth_objects[formatDate(now)]);

  // Data for the bar and pie charts represented as arrays
  const chartData = [
    {
      title: "NEO Count",
      count: nasaAPIData.element_count,
    },
    {
      title: "PHA Count",
      count: potentialHazard,
    },
    {
      title: "Sentry-Tracked Objects",
      count: potentialColl,
    },
    {
      title: "All Passbys Today",
      count: allUpcomingDates.length,
    },
  ];

  return (
    <div className="p-8">
      {/* Orbit Data title */}
      <h1 className="text-4xl font-bold text-white mb-8">Orbit Data</h1>

      <div className="grid grid-cols-4 gap-2 mb-8">
        <Card title="NEO Count" number={nasaAPIData.element_count} subtitle="Objects passing near Earth during the next week"/>
        <Card title="PHA Count" number={potentialHazard} subtitle="Potentially hazardous asteroids during the next week"/>
        <Card title="Sentry-Tracked Objects" number={potentialColl} subtitle="Objects that are being tracked by NASA's Sentry during the next week"/>
        <Card title="All Passbys Today" number={allUpcomingDates.length} subtitle="Objects that are passing their closest to Earth today"/>
      </div>

      {/* Data representation section */}
      <div className="space-y-8">
        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-500">
          <h2 className="text-xl font-bold text-neutral-400 mb-4">NEO Distribution</h2>
          <div className="flex items-center">
            <div className="w-1/2">
              <h3 className="text-neutral-300">Potentially Hazardous: {potentialHazard}</h3>
              <h3 className="text-neutral-300">Safe NEOs: {nasaAPIData.element_count - potentialHazard}</h3>
            </div>
            <div className="w-1/2 flex justify-center">
              <div className="w-1/2 bg-red-500 h-12 rounded-l" style={{ width: `${(potentialHazard / nasaAPIData.element_count) * 100}%` }}></div>
              <div className="w-1/2 bg-green-500 h-12 rounded-r" style={{ width: `${((nasaAPIData.element_count - potentialHazard) / nasaAPIData.element_count) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-500">
          <h2 className="text-xl font-bold text-neutral-400 mb-4">NEO Counts</h2>
          <div className="grid grid-cols-4 gap-4">
            {chartData.map(({ title, count }, index) => (
              <div key={index} className="bg-neutral-800 p-4 rounded-lg border border-neutral-500 flex flex-col items-center">
                <h3 className="text-neutral-500">{title}</h3>
                <span className="text-3xl my-2">{count}</span>
                <div className="w-full bg-neutral-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${(count / nasaAPIData.element_count) * 100}%` }} // Example: Progress bar
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
