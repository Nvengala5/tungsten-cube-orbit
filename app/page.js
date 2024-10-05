import Card from "@/components/card";
import Image from "next/image";

export default async function Home() {

  const nasaAPIData = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-10-01&end_date=2024-10-05&api_key=${process.env.NASA_API_KEY}`).then((data) => data.json());

  const test = Object.keys(nasaAPIData.near_earth_objects).map((date) => {
    return nasaAPIData.near_earth_objects[date].filter(i => i.is_potentially_hazardous_asteroid).length
  }).reduce((prev, curr) => prev + curr);

  console.log(test)

  return (
    <div>
      <h1 className="text-white">hi there</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card title="NEO Count" number={nasaAPIData.element_count} subtitle="Objects passing near Earth from 10/1/24 to 10/5/24"/>
        <Card title="Dangerous NEO Count" number={test} subtitle="Potentially hazardous asteroids during the 5-day period"/>
        <Card title="NEO Count" number="27" subtitle="newsub"/>
        <Card title="NEO Count" number="28" subtitle="newsub"/>
      </div>
    </div>
  );
}
