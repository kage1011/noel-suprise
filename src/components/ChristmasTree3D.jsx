import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Gift, Eye, RotateCw } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function ChristmasTree3D({
  items = [],
  onSelectItem,
  disabled = false,
  openedItemIds = [],
}) {
  const mountRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // References for three.js cleanup and interaction
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const interactableMeshes = useRef([]);
  const starMeshRef = useRef(null);
  const lightsArrayRef = useRef([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 9.5);
    camera.lookAt(0, 2.2, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Point lights for magical glow
    const pointLightGold = new THREE.PointLight(0xf59e0b, 2.5, 12);
    pointLightGold.position.set(0, 4.5, 1.5);
    scene.add(pointLightGold);

    const pointLightRed = new THREE.PointLight(0xef4444, 2.0, 10);
    pointLightRed.position.set(-2, 2, 2);
    scene.add(pointLightRed);

    const pointLightGreen = new THREE.PointLight(0x10b981, 2.0, 10);
    pointLightGreen.position.set(2, 2, 2);
    scene.add(pointLightGreen);

    // TREE GROUP (everything that rotates)
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // BASE / SNOW PLATFORM
    const snowPlatformGeo = new THREE.CylinderGeometry(3.6, 3.9, 0.35, 32);
    const snowPlatformMat = new THREE.MeshStandardMaterial({
      color: 0xecfeff,
      roughness: 0.6,
      metalness: 0.1,
    });
    const snowPlatform = new THREE.Mesh(snowPlatformGeo, snowPlatformMat);
    snowPlatform.position.y = -0.15;
    snowPlatform.receiveShadow = true;
    treeGroup.add(snowPlatform);

    // TREE TRUNK
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.2, 16);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5c2c16,
      roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // PINE TREE TIERS
    const foliageColors = [0x0f4024, 0x14532d, 0x166534, 0x15803d];
    const tiers = [
      { radius: 2.5, height: 1.6, y: 1.4 },
      { radius: 2.1, height: 1.5, y: 2.2 },
      { radius: 1.65, height: 1.4, y: 3.0 },
      { radius: 1.2, height: 1.3, y: 3.7 },
      { radius: 0.7, height: 1.0, y: 4.4 },
    ];

    tiers.forEach((tier, idx) => {
      const coneGeo = new THREE.ConeGeometry(tier.radius, tier.height, 24);
      const coneMat = new THREE.MeshStandardMaterial({
        color: foliageColors[idx % foliageColors.length],
        roughness: 0.7,
        flatShading: true,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = tier.y;
      cone.castShadow = true;
      cone.receiveShadow = true;
      treeGroup.add(cone);

      // Snow frosting on the edges
      const snowRimGeo = new THREE.TorusGeometry(tier.radius * 0.96, 0.06, 8, 24);
      const snowRimMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
      });
      const snowRim = new THREE.Mesh(snowRimGeo, snowRimMat);
      snowRim.rotation.x = Math.PI / 2;
      snowRim.position.y = tier.y - tier.height / 2 + 0.05;
      treeGroup.add(snowRim);
    });

    // TOP STAR (Spangles & glowing golden star)
    const starShape = new THREE.Shape();
    const starPoints = 5;
    const outerR = 0.42;
    const innerR = 0.18;
    for (let i = 0; i < starPoints * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i / (starPoints * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starExtrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const starGeo = new THREE.ExtrudeGeometry(starShape, starExtrudeSettings);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(0, 5.0, 0);
    treeGroup.add(star);
    starMeshRef.current = star;

    // SPIRAL FAIRY LIGHTS
    const lightsCount = 90;
    const lightColors = [0xffd700, 0xef4444, 0x10b981, 0x38bdf8, 0xf43f5e];
    const lightsGroup = new THREE.Group();
    const lightSpheres = [];

    for (let i = 0; i < lightsCount; i++) {
      const progress = i / lightsCount; // 0 to 1
      const y = 0.8 + progress * 3.8;
      const radiusAtY = (1 - progress * 0.75) * 2.1;
      const angle = progress * Math.PI * 14; // 7 full loops

      const x = Math.cos(angle) * (radiusAtY + 0.1);
      const z = Math.sin(angle) * (radiusAtY + 0.1);

      const color = lightColors[i % lightColors.length];
      const lightGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const lightMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.4,
        roughness: 0.2,
      });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.set(x, y, z);
      lightsGroup.add(lightMesh);
      lightSpheres.push(lightMesh);
    }
    treeGroup.add(lightsGroup);
    lightsArrayRef.current = lightSpheres;

    // INTERACTABLE ORNAMENTS & GIFTS
    const meshes = [];
    const itemCount = items.length;

    items.forEach((item, index) => {
      const isAlreadyOpened = openedItemIds.includes(item.id);

      // Distribute items in spirals & under the tree
      const angle = (index / itemCount) * Math.PI * 2 + (index % 2) * 0.4;
      const tierProgress = 0.15 + (index / itemCount) * 0.7;
      const y = 0.7 + tierProgress * 3.2;
      const radiusAtY = (1 - tierProgress * 0.7) * 2.2;
      const x = Math.cos(angle) * (radiusAtY + 0.15);
      const z = Math.sin(angle) * (radiusAtY + 0.15);

      const ornamentGroup = new THREE.Group();
      ornamentGroup.position.set(x, y, z);

      let mainMesh;

      if (item.type.includes('gift')) {
        // 3D Gift Box with Ribbon
        const boxGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
        const boxMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(item.color || '#e11d48'),
          metalness: 0.3,
          roughness: 0.4,
          transparent: isAlreadyOpened,
          opacity: isAlreadyOpened ? 0.4 : 1,
        });
        mainMesh = new THREE.Mesh(boxGeo, boxMat);
        mainMesh.castShadow = true;

        // Ribbon
        const ribGeo = new THREE.BoxGeometry(0.33, 0.33, 0.08);
        const ribMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.8,
          roughness: 0.3,
          emissive: 0xffd700,
          emissiveIntensity: 0.2,
        });
        const ribbon1 = new THREE.Mesh(ribGeo, ribMat);
        const ribbon2 = ribbon1.clone();
        ribbon2.rotation.y = Math.PI / 2;
        mainMesh.add(ribbon1);
        mainMesh.add(ribbon2);
      } else if (item.type.includes('candy')) {
        // Candy Cane
        const caneGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12);
        const caneMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          roughness: 0.3,
          transparent: isAlreadyOpened,
          opacity: isAlreadyOpened ? 0.4 : 1,
        });
        mainMesh = new THREE.Mesh(caneGeo, caneMat);
        mainMesh.rotation.z = Math.PI / 4;
      } else if (item.type.includes('bell')) {
        // Golden Bell
        const bellGeo = new THREE.ConeGeometry(0.18, 0.3, 16);
        const bellMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.15,
          emissive: 0xd97706,
          emissiveIntensity: 0.3,
          transparent: isAlreadyOpened,
          opacity: isAlreadyOpened ? 0.4 : 1,
        });
        mainMesh = new THREE.Mesh(bellGeo, bellMat);
      } else {
        // Shiny Bauble
        const baubleGeo = new THREE.SphereGeometry(0.2, 24, 24);
        const baubleMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(item.color || '#dc2626'),
          metalness: 0.85,
          roughness: 0.15,
          emissive: new THREE.Color(item.color || '#dc2626'),
          emissiveIntensity: isAlreadyOpened ? 0.1 : 0.25,
          transparent: isAlreadyOpened,
          opacity: isAlreadyOpened ? 0.4 : 1,
        });
        mainMesh = new THREE.Mesh(baubleGeo, baubleMat);
        mainMesh.castShadow = true;

        // Bauble cap
        const capGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.06, 12);
        const capMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.2;
        mainMesh.add(cap);
      }

      // Metadata on the mesh
      mainMesh.userData = {
        item,
        originalScale: new THREE.Vector3(1, 1, 1),
        isOpened: isAlreadyOpened,
      };

      ornamentGroup.add(mainMesh);
      treeGroup.add(ornamentGroup);
      meshes.push(mainMesh);
    });

    interactableMeshes.current = meshes;

    // DRAG TO ROTATE CONTROLS
    let isDragging = false;
    let previousMouseX = 0;
    let rotationVelocity = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const handleMouseMove = (e) => {
      // Raycasting for hover
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const intersects = raycaster.intersectObjects(interactableMeshes.current, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData?.item && hit.parent) {
          hit = hit.parent;
        }

        if (hit && hit.userData?.item) {
          container.style.cursor = disabled || hit.userData.isOpened ? 'not-allowed' : 'pointer';
          setHoveredItem(hit.userData.item);

          // Pop effect
          if (!hit.userData.isOpened) {
            hit.scale.set(1.25, 1.25, 1.25);
          }
        }
      } else {
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
        setHoveredItem(null);

        // Reset scales
        interactableMeshes.current.forEach((m) => {
          m.scale.set(1, 1, 1);
        });
      }

      if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        rotationVelocity = deltaX * 0.005;
        treeGroup.rotation.y += rotationVelocity;
        previousMouseX = e.clientX;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = (e) => {
      if (disabled) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const intersects = raycaster.intersectObjects(interactableMeshes.current, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData?.item && hit.parent) {
          hit = hit.parent;
        }

        if (hit && hit.userData?.item) {
          const item = hit.userData.item;
          if (hit.userData.isOpened) return;

          playClickSound();
          if (onSelectItem) {
            onSelectItem(item);
          }
        }
      }
    };

    // Touch events for mobile/tablet
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMouseX;
        rotationVelocity = deltaX * 0.005;
        treeGroup.rotation.y += rotationVelocity;
        previousMouseX = e.touches[0].clientX;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);

    dom.addEventListener('touchstart', handleTouchStart);
    dom.addEventListener('touchmove', handleTouchMove);
    dom.addEventListener('touchend', handleTouchEnd);

    // ANIMATION LOOP
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Top star gentle rotation & pulse
      if (starMeshRef.current) {
        starMeshRef.current.rotation.y = elapsedTime * 0.6;
        const pulse = 0.5 + Math.sin(elapsedTime * 3) * 0.3;
        starMeshRef.current.material.emissiveIntensity = pulse;
      }

      // Fairy lights twinkling
      if (lightsArrayRef.current) {
        lightsArrayRef.current.forEach((l, i) => {
          const wave = Math.sin(elapsedTime * 4 + i);
          l.material.emissiveIntensity = 0.6 + wave * 0.8;
        });
      }

      // Tree gentle idle spin if autoRotate is enabled and not dragging
      if (autoRotate && !isDragging) {
        treeGroup.rotation.y += 0.003;
      } else if (!isDragging && Math.abs(rotationVelocity) > 0.0001) {
        // Inertia damping
        treeGroup.rotation.y += rotationVelocity;
        rotationVelocity *= 0.94;
      }

      renderer.render(scene, camera);
    };

    animate();

    // WINDOW RESIZE
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [items, openedItemIds, disabled, autoRotate, onSelectItem]);

  return (
    <div className="relative w-full h-[520px] md:h-[600px] rounded-3xl overflow-hidden glass-panel border border-amber-500/20 shadow-2xl flex flex-col items-center justify-center">
      {/* Three.js canvas container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-400/30 text-xs text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Xoay cây 360° để ngắm các món quà!</span>
        </div>

        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-full border border-white/20 transition-all hover:border-amber-400"
          title="Bật/Tắt tự động xoay"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '6s' }} />
          <span>{autoRotate ? 'Đang xoay' : 'Dừng xoay'}</span>
        </button>
      </div>

      {/* Floating Hover Card */}
      {hoveredItem && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all transform animate-bounce">
          <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-amber-400 text-white px-5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-inner"
              style={{ backgroundColor: hoveredItem.color || '#ef4444' }}
            >
              <Gift className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <span>Mã Bí Mật: {hoveredItem.code}</span>
                <span className="text-[10px] bg-red-600/60 px-1.5 py-0.5 rounded text-white">{hoveredItem.score}</span>
              </div>
              <div className="text-sm font-bold text-white tracking-wide">
                {openedItemIds.includes(hoveredItem.id) ? 'Đã được mở trước đó' : '✨ Nhấn để mở món quà này!'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Accessible Tray (Click to select alternative) */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 z-10 pointer-events-auto">
        <span className="text-[11px] text-slate-400 hidden sm:inline whitespace-nowrap bg-black/40 px-2 py-1 rounded">
          Chọn nhanh:
        </span>
        <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1">
          {items.map((item) => {
            const isOpened = openedItemIds.includes(item.id);
            return (
              <button
                key={item.id}
                disabled={disabled || isOpened}
                onClick={() => {
                  playClickSound();
                  if (onSelectItem) onSelectItem(item);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all whitespace-nowrap ${
                  isOpened
                    ? 'bg-slate-800/60 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed line-through'
                    : 'bg-red-950/70 hover:bg-red-900 border-amber-400/40 text-amber-200 hover:border-amber-300 hover:scale-105 active:scale-95 shadow-sm'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#ef4444' }} />
                <span>{item.code.replace('NOEL-MAGIC-', '#')}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
