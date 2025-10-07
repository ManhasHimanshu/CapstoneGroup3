import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from '../styles/Dashboard.module.css';

export default function Orientation3D({ quat /* [w,x,y,z] */, height = 260 }) {
  const hostRef = useRef(null);
  const objRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);

  // Init once
  useEffect(() => {
    const el = hostRef.current;
    const w = el.clientWidth,
      h = height;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0d);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(2.4, 1.6, 2.6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    el.innerHTML = '';
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 3, 2);
    scene.add(dir);

    const grid = new THREE.GridHelper(6, 6, 0x444444, 0x222222);
    grid.position.y = -0.5;
    scene.add(grid);

    const group = new THREE.Group();
    objRef.current = group;
    scene.add(group);

    // Simple bat geometry
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 });
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.85, 24), mat);
    barrel.rotation.z = Math.PI / 2; // cylinder is Y-axis; rotate so length is X-axis
    group.add(barrel);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.35, 24), mat);
    handle.position.x = -0.6;
    handle.rotation.z = Math.PI / 2;
    group.add(handle);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 16), mat);
    knob.position.x = -0.8;
    group.add(knob);

    const axes = new THREE.AxesHelper(0.3); // X=red, Y=green, Z=blue
    group.add(axes);

    const render = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    render();

    const onResize = () => {
      const w2 = el.clientWidth;
      renderer.setSize(w2, height);
      camera.aspect = w2 / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      el.innerHTML = '';
      renderer.dispose();
    };
  }, [height]);

  // Apply quaternion whenever we receive one
  useEffect(() => {
    if (!quat || !objRef.current) return;
    const [w, x, y, z] = quat;

    // Sensor -> scene adjustment:
    // tweak this to match how your board is mounted on the bat.
    const qSensor = new THREE.Quaternion(x, y, z, w);
    const qAdjust = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0, 'XYZ')); // example
    objRef.current.quaternion.copy(qSensor.multiply(qAdjust));
  }, [quat]);

  return <div className={styles.viewer} ref={hostRef} style={{ height }} />;
}
