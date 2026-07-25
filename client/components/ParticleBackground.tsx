"use client";

import { useEffect, useRef } from "react";
import type { Vector3 } from "three";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationId: number;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      camera.position.z = 350;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      // ── Particles ──────────────────────────────────────────
      const COUNT = 130;
      const spread = 700;
      const verts: Vector3[] = Array.from({ length: COUNT }, () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * 300
        )
      );

      const ptGeo = new THREE.BufferGeometry();
      const ptArr = new Float32Array(COUNT * 3);
      verts.forEach((v, i) => { ptArr[i * 3] = v.x; ptArr[i * 3 + 1] = v.y; ptArr[i * 3 + 2] = v.z; });
      ptGeo.setAttribute("position", new THREE.BufferAttribute(ptArr, 3));

      const ptMat = new THREE.PointsMaterial({ color: 0x7c6cf0, size: 2.5, transparent: true, opacity: 0.8 });
      const points = new THREE.Points(ptGeo, ptMat);
      scene.add(points);

      // ── Connection lines ───────────────────────────────────
      const lineVerts: number[] = [];
      const MAX_DIST = 110;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          if (verts[i].distanceTo(verts[j]) < MAX_DIST) {
            lineVerts.push(verts[i].x, verts[i].y, verts[i].z, verts[j].x, verts[j].y, verts[j].z);
          }
        }
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0x7c6cf0, transparent: true, opacity: 0.12 });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);

      // ── Floating accent spheres ────────────────────────────
      const sphereColors = [0x7c6cf0, 0x4fc3f7, 0x34d399];
      const spheres = sphereColors.map((color, i) => {
        const geo = new THREE.SphereGeometry(3 + i * 1.5, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 150
        );
        scene.add(mesh);
        return mesh;
      });

      // ── Mouse tracking ─────────────────────────────────────
      let mouseX = 0;
      let mouseY = 0;
      const onMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouseMove);

      // ── Resize ─────────────────────────────────────────────
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);

      // ── Animate ────────────────────────────────────────────
      let t = 0;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        t += 0.0008;

        points.rotation.y = t * 0.15 + mouseX * 0.08;
        points.rotation.x = t * 0.08 + mouseY * 0.04;
        lines.rotation.copy(points.rotation);

        spheres.forEach((s, i) => {
          s.position.y += Math.sin(t * 0.5 + i * 2) * 0.3;
          s.rotation.y += 0.005;
        });

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        ptGeo.dispose();
        ptMat.dispose();
        lineGeo.dispose();
        lineMat.dispose();
      };
    })();

    return () => { cleanup?.(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
