/*// components/SolarSystem.js
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function parseCoordinates(coordinateString) {
  const regex = /X\s*=\s*([+-]?\d+\.\d+E[+-]?\d+)\s*Y\s*=\s*([+-]?\d+\.\d+E[+-]?\d+)\s*Z\s*=\s*([+-]?\d+\.\d+E[+-]?\d+)/;

  const match = coordinateString.match(regex);

  if (match) {
    const x = parseFloat(match[1]) / 100000;
    const y = parseFloat(match[2]) / 100000;
    const z = parseFloat(match[3]) / 100000;

    return { x, y, z };
  } else {
    throw new Error("Invalid coordinate string format");
  }
}

export default function SolarSystem() {
  const mountRef = useRef(null);
  const [planetData, setPlanetData] = useState({});
  const [frame, setFrame] = useState(0);

  // Fetch orbital data for planets and Moon from JPL Horizons API
  const fetchPlanetData = async () => {
    const planetIds = {
      mercury: '199',
      venus: '299',
      earth: '399',
      moon: '301',
      mars: '499',
    };

    const startDate = '2023-10-06';
    const stopDate = '2024-10-06';
    const stepSize = '1 d'; // Daily data

    let data = {};

    for (const [planet, id] of Object.entries(planetIds)) {
      const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${id}'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTOR'&CENTER='500@0'&START_TIME='${startDate}'&STOP_TIME='${stopDate}'&STEP_SIZE='${stepSize}'`;

      try {
        const response = await fetch(url);
        const { result } = await response.json();
        const start = result.indexOf('$$SOE');
        const end = result.indexOf('$$EOE');

        const relevant = result.slice(start, end);
        const lineSplit = relevant.split('\n');
        let planetData = [];
        for (let i = 2; i < lineSplit.length; i += 4) {
          planetData.push(parseCoordinates(lineSplit[i]));
        }

        data[planet] = planetData;
      } catch (error) {
        console.error(`Failed to fetch data for ${planet}`, error);
      }
    }
    setPlanetData(data);
  };

  useEffect(() => {
    fetchPlanetData();
  }, []);

  useEffect(() => {
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(125, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add a light source (the Sun)
    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 0, 0);
    scene.add(light);

    // Create planet function
    const createPlanet = (size, color) => {
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color });
      const planet = new THREE.Mesh(geometry, material);
      scene.add(planet);
      return planet;
    };

    // Scale down distances and sizes for visualization purposes
    const distanceScale = 0.05;
    const sizeScale = 2;

    // Create planets and Moon (scaled sizes and distances)
    const sun = createPlanet(6 * sizeScale, 0xffff00); 
    const mercury = createPlanet(0.8 * sizeScale, 0xbebebe); 
    const venus = createPlanet(1.2 * sizeScale, 0xffa500);
    const earth = createPlanet(1.3 * sizeScale, 0x0000ff);
    const moon = createPlanet(0.6 * sizeScale, 0xffffff); 
    const mars = createPlanet(1.1 * sizeScale, 0xff4500);

    // Move the camera back
    camera.position.z = 60;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Ensure the frame index doesn't go out of bounds
      const totalFrames = planetData.mercury ? planetData.mercury.length : 1;
      setFrame((prevFrame) => (prevFrame + 1) % totalFrames); // Loop through available frames

      // Update planet positions using the fetched data
      if (planetData.mercury) {
        mercury.position.set(
          planetData.mercury[frame].x * distanceScale,
          planetData.mercury[frame].y * distanceScale,
          planetData.mercury[frame].z * distanceScale
        );
      }
      if (planetData.venus) {
        venus.position.set(
          planetData.venus[frame].x * distanceScale,
          planetData.venus[frame].y * distanceScale,
          planetData.venus[frame].z * distanceScale
        );
      }
      if (planetData.earth) {
        earth.position.set(
          planetData.earth[frame].x * distanceScale,
          planetData.earth[frame].y * distanceScale,
          planetData.earth[frame].z * distanceScale
        );

        // Update Moon position relative to Earth
        if (planetData.moon) {
          moon.position.set(
            earth.position.x + planetData.moon[frame].x * distanceScale * 0.00257,
            earth.position.y + planetData.moon[frame].y * distanceScale * 0.00257,
            earth.position.z + planetData.moon[frame].z * distanceScale * 0.00257
          );
        }
      }
      if (planetData.mars) {
        mars.position.set(
          planetData.mars[frame].x * distanceScale,
          planetData.mars[frame].y * distanceScale,
          planetData.mars[frame].z * distanceScale
        );
      }

      // Render the scene
      renderer.render(scene, camera);
    };

    // Start the animation loop
    animate();

    // Clean up on component unmount
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [planetData, frame]);

  return <div ref={mountRef} style={{ width: 'calc(100%-160px)', height: '100vh' }} />;
}*/

"use client"; // Ensure this component is treated as a Client Component

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Utility function to format dates as 'YYYY-MM-DD'
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function parseCoordinates(coordinateString) {
  const regex = /X\s*=\s*([+-]?\d+\.\d+E[+-]?\d+)\s*Y\s*=\s*([+-]?\d+\.\d+E[+-]?\d+)\s*Z\s*=\s*([+-]?\d+\.\d+E[+-]?\d+)/;

  const match = coordinateString.match(regex);

  if (match) {
    const x = parseFloat(match[1]) / 100000;
    const y = parseFloat(match[2]) / 100000;
    const z = parseFloat(match[3]) / 100000;

    return { x, y, z };
  } else {
    throw new Error("Invalid coordinate string format");
  }
}

export default function SolarSystem() {
  const mountRef = useRef(null);
  const [planetData, setPlanetData] = useState({});
  const [frame, setFrame] = useState(0);
  const [isRunning, setIsRunning] = useState(true);  // Track animation state
  const [totalFrames, setTotalFrames] = useState(0);  // Store the total number of frames
  const [width] = useState(800); // Fixed width of the scene
  const [height] = useState(600); // Fixed height of the scene

  // Hardcode relative dates
  const today = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(today.getFullYear() + 1);

  const [startDate, setStartDate] = useState(formatDate(today));   // Default start date as today
  const [endDate, setEndDate] = useState(formatDate(oneYearLater)); // Default end date one year later

  // Handle change for start date input
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  // Handle change for end date input
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // Fetch orbital data for planets and Moon from JPL Horizons API
  const fetchPlanetData = async () => {
    const planetIds = {
      mercury: '199',
      venus: '299',
      earth: '399',
      moon: '301',
      mars: '499',
    };

    const stepSize = '1 d'; // Daily data

    let data = {};

    for (const [planet, id] of Object.entries(planetIds)) {
      const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${id}'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTOR'&CENTER='500@0'&START_TIME='${startDate}'&STOP_TIME='${endDate}'&STEP_SIZE='${stepSize}'`;

      try {
        const response = await fetch(url);
        const { result } = await response.json();
        const start = result.indexOf('$$SOE');
        const end = result.indexOf('$$EOE');

        const relevant = result.slice(start, end);
        const lineSplit = relevant.split('\n');
        let planetData = [];
        for (let i = 2; i < lineSplit.length; i += 4) {
          planetData.push(parseCoordinates(lineSplit[i]));
        }

        data[planet] = planetData;
      } catch (error) {
        console.error(`Failed to fetch data for ${planet}`, error);
      }
    }
    setPlanetData(data);
  };

  // Fetch data when component mounts or when dates are changed
  useEffect(() => {
    fetchPlanetData();
  }, [startDate, endDate]);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(125, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 0, 0);
    scene.add(light);

    const createPlanet = (size, color) => {
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color });
      const planet = new THREE.Mesh(geometry, material);
      scene.add(planet);
      return planet;
    };

    const distanceScale = 0.05;
    const sizeScale = 2;

    const sun = createPlanet(6 * sizeScale, 0xffff00); 
    const mercury = createPlanet(0.8 * sizeScale, 0xbebebe); 
    const venus = createPlanet(1.2 * sizeScale, 0xffa500);
    const earth = createPlanet(1.3 * sizeScale, 0x0000ff);
    const moon = createPlanet(0.6 * sizeScale, 0xffffff); 
    const mars = createPlanet(1.1 * sizeScale, 0xff4500);

    camera.position.z = 60;

    const animate = () => {
      requestAnimationFrame(animate);

      const totalFrames = planetData.mercury ? planetData.mercury.length : 1;
      setTotalFrames(totalFrames);

      if (isRunning) {
        setFrame((prevFrame) => (prevFrame + 1) % totalFrames);
      }

      if (planetData.mercury) {
        mercury.position.set(
          planetData.mercury[frame].x * distanceScale,
          planetData.mercury[frame].y * distanceScale,
          planetData.mercury[frame].z * distanceScale
        );
      }
      if (planetData.venus) {
        venus.position.set(
          planetData.venus[frame].x * distanceScale,
          planetData.venus[frame].y * distanceScale,
          planetData.venus[frame].z * distanceScale
        );
      }
      if (planetData.earth) {
        earth.position.set(
          planetData.earth[frame].x * distanceScale,
          planetData.earth[frame].y * distanceScale,
          planetData.earth[frame].z * distanceScale
        );

        if (planetData.moon) {
          moon.position.set(
            earth.position.x + planetData.moon[frame].x * distanceScale * 0.00257,
            earth.position.y + planetData.moon[frame].y * distanceScale * 0.00257,
            earth.position.z + planetData.moon[frame].z * distanceScale * 0.00257
          );
        }
      }
      if (planetData.mars) {
        mars.position.set(
          planetData.mars[frame].x * distanceScale,
          planetData.mars[frame].y * distanceScale,
          planetData.mars[frame].z * distanceScale
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [planetData, frame, isRunning, width, height]);

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div style={{ width: '800px', height: '600px', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '800px', height: '600px' }} />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={toggleAnimation} style={{ margin: '5px' }}>
          {isRunning ? 'Pause' : 'Play'} Animation
        </button>
        <div style={{ margin: '5px' }}>
          <label>
            Start Date: 
            <input 
              type="date" 
              value={startDate} 
              onChange={handleStartDateChange} 
              style={{ marginLeft: '5px' }} 
            />
          </label>
        </div>
        <div style={{ margin: '5px' }}>
          <label>
            End Date: 
            <input 
              type="date" 
              value={endDate} 
              onChange={handleEndDateChange} 
              style={{ marginLeft: '5px' }} 
            />
          </label>
        </div>
      </div>
    </div>
  );
}

