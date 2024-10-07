/*"use client"; // Ensure this component is treated as a Client Component

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
      <div style={{ textAlign: 'center', marginTop: '25px' }}>
        <div style={{ display: 'inline-block' }}>
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
        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
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
        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
          <button onClick={toggleAnimation} style={{ marginLeft: '5px' }}>
            {isRunning ? 'Pause' : 'Play'} Animation
          </button>
        </div>
      </div>
    </div>
  );
}*/
"use client"; // Ensure this component is treated as a Client Component

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
  const [isRunning, setIsRunning] = useState(true);
  const [totalFrames, setTotalFrames] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [width] = useState(800);
  const [height] = useState(600);

  // Hardcode relative dates
  const today = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(today.getFullYear() + 1);

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(oneYearLater));

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
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
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

    const createOrbit = (coordinates) => {
      const points = coordinates.map(coord => 
        new THREE.Vector3(coord.x * 0.05, coord.y * 0.05, coord.z * 0.05)
      );

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.5, transparent: true });
      const orbitLine = new THREE.Line(geometry, material);
      scene.add(orbitLine);
      return orbitLine;
    };

    const distanceScale = 0.05;
    const sizeScale = 2;

    const sun = createPlanet(6 * sizeScale, 0xffff00);
    const mercury = createPlanet(0.8 * sizeScale, 0xbebebe);
    const venus = createPlanet(1.2 * sizeScale, 0xffa500);
    const earth = createPlanet(1.3 * sizeScale, 0x0000ff);
    const moon = createPlanet(0.6 * sizeScale, 0xffffff);
    const mars = createPlanet(1.1 * sizeScale, 0xff4500);

    // Create orbital paths using planet data
    createOrbit(planetData.mercury || []);
    createOrbit(planetData.venus || []);
    createOrbit(planetData.earth || []);
    createOrbit(planetData.mars || []);

    camera.position.z = 150;

    // Initialize OrbitControls for interactivity
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable damping for smoother control
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation

    const animate = () => {
      requestAnimationFrame(animate);

      const totalFrames = planetData.mercury ? planetData.mercury.length : 1;
      setTotalFrames(totalFrames);

      // Update frame index if animation is running
      if (isRunning) {
        setCurrentFrame((prevFrame) => (prevFrame + 1) % totalFrames); // Increment current frame
      }

      // Update positions of the planets based on the current frame
      if (planetData.mercury) {
        mercury.position.set(
          planetData.mercury[currentFrame].x * distanceScale,
          planetData.mercury[currentFrame].y * distanceScale,
          planetData.mercury[currentFrame].z * distanceScale
        );
      }
      if (planetData.venus) {
        venus.position.set(
          planetData.venus[currentFrame].x * distanceScale,
          planetData.venus[currentFrame].y * distanceScale,
          planetData.venus[currentFrame].z * distanceScale
        );
      }
      if (planetData.earth) {
        earth.position.set(
          planetData.earth[currentFrame].x * distanceScale,
          planetData.earth[currentFrame].y * distanceScale,
          planetData.earth[currentFrame].z * distanceScale
        );

        if (planetData.moon) {
          moon.position.set(
            earth.position.x + planetData.moon[currentFrame].x * distanceScale * 0.00257,
            earth.position.y + planetData.moon[currentFrame].y * distanceScale * 0.00257,
            earth.position.z + planetData.moon[currentFrame].z * distanceScale * 0.00257
          );
        }
      }
      if (planetData.mars) {
        mars.position.set(
          planetData.mars[currentFrame].x * distanceScale,
          planetData.mars[currentFrame].y * distanceScale,
          planetData.mars[currentFrame].z * distanceScale
        );
      }

      controls.update(); // Update controls every frame
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [planetData, isRunning, width, height, currentFrame]);

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div style={{ width: '800px', height: '600px', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '800px', height: '600px' }} />
      <div style={{ textAlign: 'center', marginTop: '25px' }}>
        <div style={{ display: 'inline-block'}}>
          <label>
            Start Date: 
            <input 
              type="date" 
              value={startDate} 
              onChange={handleStartDateChange} 
              style={{ marginLeft: '5px', padding: '5px', fontSize: '14px'}} 
            />
          </label>
        </div>
        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
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
        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
          <button onClick={toggleAnimation} style={{ marginLeft: '5px' }}>
            {isRunning ? 'Pause' : 'Play'} Animation
          </button>
        </div>
      </div>
    </div>
  );
}
