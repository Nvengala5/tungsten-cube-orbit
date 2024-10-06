// components/SolarSystem.js
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
      mercury: '199', // Mercury
      venus: '299', // Venus
      earth: '399', // Earth
      moon: '301',  // Moon
      mars: '499',  // Mars
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
        let planetData = []
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
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [planetData, frame]);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
}
