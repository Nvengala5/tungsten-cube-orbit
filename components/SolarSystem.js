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

  // Fetch orbital data for planets and Moon from JPL Horizons API
  // Fetch orbital data for planets and Moon from JPL Horizons API
const fetchPlanetData = async () => {
  const planetIds = {
    mercury: '199', // Mercury
    venus: '299', // Venus
    earth: '399', // Earth
    moon: '301',  // Moon
    mars: '499',  // Mars
  };

  const startDate = '2024-10-06';
  const stopDate = '2024-10-07';
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
      const lineSplit = relevant.split('\n').slice(1)[1];
      console.log(parseCoordinates(lineSplit))

      data[planet] = parseCoordinates(lineSplit);

    } catch (error) {
      console.error(`Failed to fetch data for ${planet}`, error);
    }
  }

  console.log({ data });
  setPlanetData(data);
};


  useEffect(() => {
    fetchPlanetData().then(() => {
      
    })

  }, []);

  useEffect(() => {
// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(150, window.innerWidth / window.innerHeight, 0.1, 1000);
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
const distanceScale = 0.05; // Larger scale for better visibility
const sizeScale = 2; // Increased size scale

// Create planets and Moon (scaled sizes and distances)
const sun = createPlanet(6 * sizeScale, 0xffff00); // Sun (increased size)
const mercury = createPlanet(0.8 * sizeScale, 0xbebebe); // Mercury
const venus = createPlanet(1.2 * sizeScale, 0xffa500); // Venus
const earth = createPlanet(1.3 * sizeScale, 0x0000ff); // Earth
const moon = createPlanet(0.4 * sizeScale, 0xaaaaaa); // Moon
const mars = createPlanet(1.1 * sizeScale, 0xff4500); // Mars

// Move the camera back so that everything is visible
camera.position.z = 60; // Adjusted for larger scale

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);

  // Update planet positions using the fetched data
  const time = Date.now() * 0.001;

  if (planetData.mercury) {
    mercury.position.set(
      planetData.mercury.x * distanceScale,
      planetData.mercury.y * distanceScale,
      planetData.mercury.z * distanceScale
    );
  }
  if (planetData.venus) {
    venus.position.set(
      planetData.venus.x * distanceScale,
      planetData.venus.y * distanceScale,
      planetData.venus.z * distanceScale
    );
  }
  if (planetData.earth) {
    earth.position.set(
      planetData.earth.x * distanceScale,
      planetData.earth.y * distanceScale,
      planetData.earth.z * distanceScale
    );

    // Update Moon position relative to Earth
    if (planetData.moon) {
      moon.position.set(
        earth.position.x + planetData.moon.x * distanceScale * 0.00257, // Scale moon distance
        earth.position.y + planetData.moon.y * distanceScale * 0.00257,
        earth.position.z + planetData.moon.z * distanceScale * 0.00257
      );
    }
  }
  if (planetData.mars) {
    mars.position.set(
      planetData.mars.x * distanceScale,
      planetData.mars.y * distanceScale,
      planetData.mars.z * distanceScale
    );
  }

  renderer.render(scene, camera);
};

animate();

// Clean up on component unmount
return () => {
  mountRef.current.removeChild(renderer.domElement);
};
  }, [planetData])

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
}
