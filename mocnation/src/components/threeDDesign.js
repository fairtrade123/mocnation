import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

const ThreeDDesign = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls for camera manipulation
    const controls = new OrbitControls(camera, renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);

    // Create shapes (e.g., LEGO bricks)
    const createShape = (color, position) => {
      const geometry = new THREE.BoxGeometry(1, 0.5, 0.5);
      const material = new THREE.MeshStandardMaterial({ color });
      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(...position);
      scene.add(shape);
      return shape;
    };

    const shapes = [
      createShape(0xff0000, [0, 0, 0]),
      createShape(0x00ff00, [2, 0, 0]),
      createShape(0x0000ff, [-2, 0, 0]),
    ];

    // Camera position
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const saveDesign = () => {
    const design = shapes.map(shape => ({
      position: shape.position.toArray(),
      color: shape.material.color.getHexString(),
    }));
    const blob = new Blob([JSON.stringify(design)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lego_design.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>3D LEGO Design Interface</h2>
      <button onClick={saveDesign}>Save Design</button>
      <div ref={mountRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
};

export default ThreeDDesign;