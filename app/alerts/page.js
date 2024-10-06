// components/Alerts.js

import React from 'react';

const Alerts = () => {
  const alerts = [
    {
      title: "Asteroid 2023 PA",
      date: "October 12, 2023",
      content: (
        <>
          <p className="mb-2">Asteroid 2023 PA is classified as a potentially hazardous object with an estimated diameter of <strong>0.54 km</strong>.</p>
          <p>This asteroid is expected to come within <strong>1.5 million kilometers</strong> of Earth. While it poses no immediate threat, it is closely monitored by NASA.</p>
        </>
      ),
    },
    {
      title: "Asteroid 2022 AG1",
      date: "October 14, 2023",
      content: (
        <>
          <p className="mb-2">Asteroid 2022 AG1 has a larger size with an estimated diameter of <strong>1.25 km</strong>.</p>
          <p>Currently, this asteroid is being monitored closely as it will make a close approach at a distance of approximately <strong>2 million kilometers</strong>.</p>
        </>
      ),
    },
    {
      title: "Asteroid 2021 RX",
      date: "October 16, 2023",
      content: (
        <>
          <p className="mb-2">Asteroid 2021 RX is another object of interest with an estimated diameter of <strong>0.78 km</strong>.</p>
          <p>This asteroid will pass Earth at a distance of <strong>3 million kilometers</strong>. It is expected to pose no risk, but monitoring continues as a precaution.</p>
        </>
      ),
    },
    {
      title: "Asteroid 2024 AB1",
      date: "October 20, 2023",
      content: (
        <>
          <p className="mb-2">Asteroid 2024 AB1 has an estimated diameter of <strong>0.92 km</strong> and is not classified as hazardous.</p>
          <p>It is scheduled to pass <strong>4 million kilometers</strong> from Earth, which poses no threat to our planet.</p>
        </>
      ),
    },
  ];

  return (
    <div className="p-8"> {/* Added margin-top for buffer space */}
      <h2 className="text-3xl font-bold text-white mb-6">Alerts: Potentially Hazardous NEOs</h2>
      {alerts.length === 0 ? (
        <p className="text-neutral-500">No alerts for hazardous NEOs at the moment.</p>
      ) : (
        <div className="space-y-6"> {/* Increased space between cards */}
          {alerts.map((alert, index) => (
            <div key={index} className="bg-neutral-950 p-4 rounded-lg border border-neutral-500"> {/* Reduced padding for shorter boxes */}
              <h3 className="text-neutral-300 font-semibold text-lg">{alert.title}</h3> {/* Increased title size */}
              <p className="text-neutral-500 text-sm">{alert.date}</p>
              <div className="text-neutral-400">{alert.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
