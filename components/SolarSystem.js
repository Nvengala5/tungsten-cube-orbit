
/**
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
  // Fetch orbital data for planets and Moon from JPL Horizons API
  const fetchPlanetData = async () => {
    const planetIds = {
      mercury: '199', // Mercury
      venus: '299', // Venus
      earth: '399', // Earth
      moon: '301',  // Moon
      mars: '499',  // Mars
    };

    const startDate = '2024-10-01';
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
        console.log(relevant)
        const lineSplit = relevant.split('\n');
        let planetData = []
        for (let i = 2; i < lineSplit.length; i += 4) {
          console.log(lineSplit[i])
          planetData.push(parseCoordinates(lineSplit[i]))
        }

        data[planet] = planetData;

      } catch (error) {
        console.error(`Failed to fetch data for ${planet}`, error);
      }
    }

    console.log({ data });
    setPlanetData(data);
  };


  useEffect(() => {
    fetchPlanetData()
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
            earth.position.x + planetData.moon[frame].x * distanceScale * 0.00257, // Scale moon distance
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

    setInterval(() => {setFrame(curr => curr > 5 ? 0: curr + 1); animate()}, 500)

  

    // Clean up on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [planetData])


  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
} */

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
  const [maxFrames, setMaxFrames] = useState(0); // To keep track of the total frames

  // Fetch orbital data for planets and Moon from JPL Horizons API
  const fetchPlanetData = async () => {
    const planetIds = {
      mercury: '199', // Mercury
      venus: '299', // Venus
      earth: '399', // Earth
      moon: '301',  // Moon
      mars: '499',  // Mars
    };

    const startDate = '2024-10-01';
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
        let planetPositions = [];

        for (let i = 2; i < lineSplit.length; i += 4) {
          planetPositions.push(parseCoordinates(lineSplit[i]));
        }

        data[planet] = planetPositions;

        // Set maxFrames based on the number of positions for the first planet (assuming all have same length)
        if (planetPositions.length > 0 && Object.keys(data).length === 1) {
          setMaxFrames(planetPositions.length);
        }

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

    // Create orbital path function
    const createOrbit = (data) => {
      const points = [];
      for (const pos of data) {
        points.push(new THREE.Vector3(pos.x * 0.05, pos.y * 0.05, pos.z * 0.05)); // Scale distance for visibility
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
      const orbit = new THREE.Line(geometry, material);
      scene.add(orbit);
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

    // Create orbits for each planet
    if (planetData.mercury) createOrbit(planetData.mercury);
    if (planetData.venus) createOrbit(planetData.venus);
    if (planetData.earth) createOrbit(planetData.earth);
    if (planetData.moon) createOrbit(planetData.moon); // This will create the Moon's path based on Earth's data
    if (planetData.mars) createOrbit(planetData.mars);

    // Move the camera back so that everything is visible
    camera.position.z = 60; // Adjusted for larger scale

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

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
            earth.position.x + planetData.moon[frame].x * distanceScale * 0.00257, // Scale moon distance
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

    // Start an interval to update the frame
    const intervalId = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % maxFrames); // Cycle through frames
    }, 1000); // Update every second

    animate();

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId); // Clear interval
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [planetData, maxFrames]);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
}
