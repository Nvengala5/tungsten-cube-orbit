// components/SolarSystem.js
'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SolarSystem() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add a light source
    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 0, 0);
    scene.add(light);

    // Create planet function
    const createPlanet = (size, color, distance) => {
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color });
      const planet = new THREE.Mesh(geometry, material);
      planet.position.x = distance;
      scene.add(planet);
      return planet;
    };

    // Create planets
    const sun = createPlanet(2, 0xffff00, 0);
    const earth = createPlanet(0.5, 0x0000ff, 5);
    const mars = createPlanet(0.3, 0xff4500, 7);

    camera.position.z = 10;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Simulate simple orbit for Earth and Mars
      earth.position.x = 5 * Math.cos(Date.now() * 0.001);
      earth.position.z = 5 * Math.sin(Date.now() * 0.001);

      mars.position.x = 7 * Math.cos(Date.now() * 0.0008);
      mars.position.z = 7 * Math.sin(Date.now() * 0.0008);

      renderer.render(scene, camera);
    };

    animate();

    // Clean up on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const apiCall = async () => {
    console.log('Calling NASA API...');
    const url =
      'https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=kXzZZhECebPb9eOf6wBPkhBn3CwpgNE3tyVX83eE';

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error with API call:', error);
    }
  };

  const apiEarthMoonSun = async () => {
    console.log('Calling Earth-Moon-Sun API...');
    const url =
      "https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND='499'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='2006-01-01'&STOP_TIME='2006-01-20'&STEP_SIZE='1%20d'&QUANTITIES='1,9,20,23,24,29'";

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error with Earth-Moon-Sun API:', error);
    }
  };

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={apiCall}>Call NASA API</button>
        <button onClick={apiEarthMoonSun} style={{ marginLeft: 10 }}>
          Call Earth-Moon-Sun API
        </button>
      </div>
    </div>
  );
};
