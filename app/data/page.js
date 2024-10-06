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
  }).reduce((prev, curr) => prev + curr)


  const allUpcomingDates = Object.values(nasaAPIData.near_earth_objects[formatDate(now)])


  return (
    <div>
      <h1 className="text-white">hi there</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card title="NEO Count" number={nasaAPIData.element_count} subtitle="Objects passing near Earth during the next week"/>
        <Card title="PHA Count" number={potentialHazard} subtitle="Potentially hazardous asteroids during the next week"/>
        <Card title="Sentry-Tracked Objects" number={potentialColl} subtitle="Objects that are being tracked by NASA's Sentry during the next week"/>
        <Card title="All Passbys Today" number={allUpcomingDates.length} subtitle="Objects that are passing their closest to Earth today"/>
      </div>
    </div>
  );
}
