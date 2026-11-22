import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Gift, RotateCw, UserCheck, Users } from 'lucide-react';
import { playClickSound } from '../utils/audio';

// Helper: Create circular avatar canvas texture
function createAvatarTexture(name, avatarUrl) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  function renderPlaceholder() {
    ctx.clearRect(0, 0, 256, 256);
    
    // Gradient festive background
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#dc2626');
    grad.addColorStop(1, '#991b1b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    // Golden border
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Initial letter
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 100px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((name || 'U').slice(0, 1).toUpperCase(), 128, 128);
  }

  renderPlaceholder();

  const texture = new THREE.CanvasTexture(canvas);

  if (avatarUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, 256, 256);

      // Clip circular
      ctx.save();
      ctx.beginPath();
      ctx.arc(128, 128, 116, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, 12, 12, 232, 232);
      ctx.restore();

      // Golden ring border
      ctx.beginPath();
      ctx.arc(128, 128, 118, 0, Math.PI * 2);
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      texture.needsUpdate = true;
    };
    img.onerror = () => {
      // Keep placeholder on error
    };
    img.src = avatarUrl;
  }

  return texture;
}

// Helper: Create 3D floating name tag sprite
function createNameTagSprite(name, isGiven, isSelected) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 112;
  const ctx = canvas.getContext('2d');

  // Background pill
  if (isSelected) {
    ctx.fillStyle = 'rgba(220, 38, 38, 0.95)';
  } else if (isGiven) {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
  } else {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  }

  ctx.beginPath();
  ctx.roundRect(10, 10, 364, 92, 46);
  ctx.fill();

  // Border
  ctx.lineWidth = 6;
  ctx.strokeStyle = isSelected ? '#fbbf24' : isGiven ? '#64748b' : '#38bdf8';
  ctx.stroke();

  // Name text
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isSelected ? '#fffbeb' : '#ffffff';

  const shortName = name.length > 11 ? name.slice(0, 10) + '…' : name;
  const prefix = isSelected ? '★ ' : isGiven ? '✓ ' : '';
  ctx.fillText(prefix + shortName, 192, 56);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.3, 0.38, 1);
  return sprite;
}

export default function ChristmasTree3D({
  items = [],
  onSelectItem,
  disabled = false,
  openedItemIds = [],
  participants = [],
  selectedGiver = null,
  onSelectGiver = null,
}) {
  const mountRef = useRef(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // References for three.js
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const interactableMeshes = useRef([]);
  const characterGroupsRef = useRef([]);
  const starMeshRef = useRef(null);
  const lightsArrayRef = useRef([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.8, 10.5);
    camera.lookAt(0, 2.0, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Point lights for magical glow
    const pointLightGold = new THREE.PointLight(0xf59e0b, 2.5, 14);
    pointLightGold.position.set(0, 4.5, 1.5);
    scene.add(pointLightGold);

    const pointLightRed = new THREE.PointLight(0xef4444, 2.0, 12);
    pointLightRed.position.set(-2.5, 1.5, 2.5);
    scene.add(pointLightRed);

    const pointLightGreen = new THREE.PointLight(0x10b981, 2.0, 12);
    pointLightGreen.position.set(2.5, 1.5, 2.5);
    scene.add(pointLightGreen);

    // Spotlight pointing at base platform for characters
    const baseSpotlight = new THREE.SpotLight(0xffedd5, 1.8, 15, Math.PI / 4, 0.5);
    baseSpotlight.position.set(0, 8, 4);
    scene.add(baseSpotlight);

    // TREE GROUP (everything that rotates on the carousel)
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // ENLARGED SNOW PLATFORM / CAROUSEL BASE
    const snowPlatformGeo = new THREE.CylinderGeometry(4.4, 4.7, 0.42, 40);
    const snowPlatformMat = new THREE.MeshStandardMaterial({
      color: 0xecfeff,
      roughness: 0.6,
      metalness: 0.1,
    });
    const snowPlatform = new THREE.Mesh(snowPlatformGeo, snowPlatformMat);
    snowPlatform.position.y = -0.21;
    snowPlatform.receiveShadow = true;
    treeGroup.add(snowPlatform);

    // Decorative Gold Rim on Base Platform
    const baseRimGeo = new THREE.TorusGeometry(4.42, 0.07, 12, 48);
    const baseRimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
    });
    const baseRim = new THREE.Mesh(baseRimGeo, baseRimMat);
    baseRim.rotation.x = Math.PI / 2;
    baseRim.position.y = 0.01;
    treeGroup.add(baseRim);

    // TREE TRUNK
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.48, 1.2, 16);
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

      // Snow rim
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

    // TOP STAR
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
      const progress = i / lightsCount;
      const y = 0.8 + progress * 3.8;
      const radiusAtY = (1 - progress * 0.75) * 2.1;
      const angle = progress * Math.PI * 14;

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

    // ALL INTERACTABLE MESHES FOR RAYCASTING
    const interactables = [];

    // ==========================================
    // 1. INTERACTABLE ORNAMENTS & GIFTS ON TREE
    // ==========================================
    const itemCount = items.length;

    items.forEach((item, index) => {
      const isAlreadyOpened = openedItemIds.includes(item.id);
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

        const capGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.06, 12);
        const capMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.2;
        mainMesh.add(cap);
      }

      mainMesh.userData = {
        kind: 'treeItem',
        item,
        originalScale: new THREE.Vector3(1, 1, 1),
        isOpened: isAlreadyOpened,
        group: ornamentGroup,
      };

      ornamentGroup.add(mainMesh);
      treeGroup.add(ornamentGroup);
      interactables.push(mainMesh);
    });

    // ==========================================
    // 2. 3D MINI CHARACTERS ON SNOW CAROUSEL
    // ==========================================
    const charGroups = [];
    const participantCount = participants.length;
    const baseRadius = 3.65; // Position on snow platform

    participants.forEach((p, idx) => {
      const isSelected = selectedGiver?.id === p.id;
      const isGiven = p.hasGiven;

      const angle = (idx / Math.max(participantCount, 1)) * Math.PI * 2;
      const x = Math.cos(angle) * baseRadius;
      const z = Math.sin(angle) * baseRadius;

      const charGroup = new THREE.Group();
      charGroup.position.set(x, 0.01, z);
      
      // Face towards outside or tangent
      charGroup.rotation.y = -angle + Math.PI / 2;

      // Base Halo Ring for Selected Giver
      if (isSelected) {
        const haloGeo = new THREE.RingGeometry(0.35, 0.48, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          side: THREE.DoubleSide,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.02;
        charGroup.add(halo);
      }

      // --- Body (Red Santa Coat) ---
      const bodyGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.44, 16);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xdc2626 : isGiven ? 0x64748b : 0xb91c1c,
        roughness: 0.6,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.22;
      body.castShadow = true;
      charGroup.add(body);

      // White fur trim at bottom of coat
      const furTrimGeo = new THREE.TorusGeometry(0.24, 0.035, 8, 16);
      const furTrimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const furTrim = new THREE.Mesh(furTrimGeo, furTrimMat);
      furTrim.rotation.x = Math.PI / 2;
      furTrim.position.y = 0.04;
      charGroup.add(furTrim);

      // Black belt & Gold buckle
      const beltGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16);
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.y = 0.2;
      charGroup.add(belt);

      const buckleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
      const buckleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
      const buckle = new THREE.Mesh(buckleGeo, buckleMat);
      buckle.position.set(0, 0.2, 0.22);
      charGroup.add(buckle);

      // Two cute little boots
      const bootGeo = new THREE.BoxGeometry(0.09, 0.08, 0.14);
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const leftBoot = new THREE.Mesh(bootGeo, bootMat);
      leftBoot.position.set(-0.09, 0.04, 0.02);
      const rightBoot = leftBoot.clone();
      rightBoot.position.set(0.09, 0.04, 0.02);
      charGroup.add(leftBoot);
      charGroup.add(rightBoot);

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.26, 8);
      const armMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.25, 0.28, 0);
      leftArm.rotation.z = Math.PI / 5;
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.25, 0.28, 0);
      rightArm.rotation.z = -Math.PI / 5;
      charGroup.add(leftArm);
      charGroup.add(rightArm);

      // If already given, holds a cute mini gift box!
      if (isGiven) {
        const miniGiftGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const miniGiftMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
        const miniGift = new THREE.Mesh(miniGiftGeo, miniGiftMat);
        miniGift.position.set(0.2, 0.2, 0.16);
        charGroup.add(miniGift);
      }

      // --- Head (Spherical Chibi Head + Front Avatar Disc) ---
      const headGroup = new THREE.Group();
      headGroup.position.y = 0.58;
      charGroup.add(headGroup);

      // Cute round head base
      const headSphereGeo = new THREE.SphereGeometry(0.23, 20, 20);
      const headSphereMat = new THREE.MeshStandardMaterial({
        color: 0xfed7aa,
        roughness: 0.7,
      });
      const headSphere = new THREE.Mesh(headSphereGeo, headSphereMat);
      headSphere.castShadow = true;
      headGroup.add(headSphere);

      // FRONT FACE AVATAR BADGE (Round disc facing front)
      const avatarTexture = createAvatarTexture(p.name, p.avatar);
      const avatarDiscGeo = new THREE.CircleGeometry(0.2, 32);
      const avatarDiscMat = new THREE.MeshBasicMaterial({
        map: avatarTexture,
        side: THREE.FrontSide,
        transparent: true,
      });
      const avatarDisc = new THREE.Mesh(avatarDiscGeo, avatarDiscMat);
      avatarDisc.position.set(0, 0, 0.17); // Slightly protruding forward on face
      headGroup.add(avatarDisc);

      // Gold frame around avatar
      const avatarFrameGeo = new THREE.TorusGeometry(0.2, 0.02, 8, 32);
      const avatarFrameMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xfbbf24 : 0xeab308,
        metalness: 0.8,
        roughness: 0.2,
      });
      const avatarFrame = new THREE.Mesh(avatarFrameGeo, avatarFrameMat);
      avatarFrame.position.set(0, 0, 0.168);
      headGroup.add(avatarFrame);

      // --- Santa Hat on Head ---
      const hatGroup = new THREE.Group();
      hatGroup.position.set(0, 0.18, 0);
      hatGroup.rotation.z = -0.22; // cute tilt
      headGroup.add(hatGroup);

      // Hat white brim
      const hatBrimGeo = new THREE.TorusGeometry(0.21, 0.045, 8, 20);
      const hatBrimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const hatBrim = new THREE.Mesh(hatBrimGeo, hatBrimMat);
      hatBrim.rotation.x = Math.PI / 2;
      hatGroup.add(hatBrim);

      // Hat red cone
      const hatConeGeo = new THREE.ConeGeometry(0.2, 0.35, 16);
      const hatConeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
      const hatCone = new THREE.Mesh(hatConeGeo, hatConeMat);
      hatCone.position.y = 0.16;
      hatGroup.add(hatCone);

      // Hat white pom-pom ball
      const pomGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const pomMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const pom = new THREE.Mesh(pomGeo, pomMat);
      pom.position.set(0.04, 0.34, 0);
      hatGroup.add(pom);

      // --- Floating 3D Name Tag Sprite ---
      const nameTagSprite = createNameTagSprite(p.name, isGiven, isSelected);
      nameTagSprite.position.set(0, 1.18, 0);
      charGroup.add(nameTagSprite);

      // Metadata for Raycasting & Click on the entire character
      const hitBoxGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.25, 12);
      const hitBoxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = 0.6;
      hitBox.userData = {
        kind: 'character',
        participant: p,
        group: charGroup,
        headGroup,
        isSelected,
        isGiven,
        originalY: 0.01,
      };
      charGroup.add(hitBox);
      interactables.push(hitBox);

      treeGroup.add(charGroup);
      charGroups.push({ group: charGroup, hitBox, participant: p, isSelected, isGiven, index: idx });
    });

    characterGroupsRef.current = charGroups;
    interactableMeshes.current = interactables;

    // ==========================================
    // INTERACTION: MOUSE & TOUCH EVENTS
    // ==========================================
    let isDragging = false;
    let previousMouseX = 0;
    let rotationVelocity = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const handleMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const intersects = raycaster.intersectObjects(interactableMeshes.current, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData?.kind && hit.parent) {
          hit = hit.parent;
        }

        if (hit && hit.userData?.kind) {
          const kind = hit.userData.kind;

          if (kind === 'character') {
            const p = hit.userData.participant;
            container.style.cursor = p.hasGiven ? 'not-allowed' : 'pointer';
            setHoveredTarget({ kind: 'character', participant: p });

            // Pop scale on character group
            if (hit.userData.group) {
              hit.userData.group.scale.set(1.18, 1.18, 1.18);
            }
          } else if (kind === 'treeItem') {
            container.style.cursor = disabled || hit.userData.isOpened ? 'not-allowed' : 'pointer';
            setHoveredTarget({ kind: 'treeItem', item: hit.userData.item, isOpened: hit.userData.isOpened });

            if (!hit.userData.isOpened) {
              hit.scale.set(1.25, 1.25, 1.25);
            }
          }
        }
      } else {
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
        setHoveredTarget(null);

        // Reset scales
        interactableMeshes.current.forEach((m) => {
          if (m.userData.kind === 'treeItem') {
            m.scale.set(1, 1, 1);
          } else if (m.userData.kind === 'character' && m.userData.group) {
            m.userData.group.scale.set(1, 1, 1);
          }
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
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const intersects = raycaster.intersectObjects(interactableMeshes.current, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData?.kind && hit.parent) {
          hit = hit.parent;
        }

        if (hit && hit.userData?.kind) {
          const kind = hit.userData.kind;

          if (kind === 'character') {
            // Clicked 3D Mini Character!
            const p = hit.userData.participant;
            if (p.hasGiven) {
              return;
            }

            playClickSound();
            if (onSelectGiver) {
              onSelectGiver(p);
            }
          } else if (kind === 'treeItem') {
            // Clicked Ornament / Gift on Tree!
            if (disabled) return;
            const item = hit.userData.item;
            if (hit.userData.isOpened) return;

            playClickSound();
            if (onSelectItem) {
              onSelectItem(item);
            }
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

    // ==========================================
    // ANIMATION LOOP
    // ==========================================
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

      // Character animations (Idle bobbing & bouncing when selected)
      if (characterGroupsRef.current) {
        characterGroupsRef.current.forEach((cg) => {
          if (cg.isSelected) {
            // Energetic celebratory jumping for current giver!
            const jump = Math.abs(Math.sin(elapsedTime * 6)) * 0.15;
            cg.group.position.y = 0.01 + jump;
          } else {
            // Gentle festive idle sway
            const idle = Math.sin(elapsedTime * 2.5 + cg.index) * 0.02;
            cg.group.position.y = 0.01 + idle;
          }
        });
      }

      // Carousel spin
      if (autoRotate && !isDragging) {
        treeGroup.rotation.y += 0.003;
      } else if (!isDragging && Math.abs(rotationVelocity) > 0.0001) {
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
      const h = container.clientHeight || 580;
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
  }, [items, openedItemIds, disabled, autoRotate, participants, selectedGiver, onSelectItem, onSelectGiver]);

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-3xl overflow-hidden glass-panel border border-amber-500/20 shadow-2xl flex flex-col items-center justify-center">
      {/* Three.js canvas container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/30 text-xs text-amber-200 shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Xoay 360° • Click nhân vật 3D mini hoặc avatar để chọn người!</span>
        </div>

        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/85 hover:bg-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-full border border-white/20 transition-all hover:border-amber-400 shadow-md"
          title="Bật/Tắt tự động xoay"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '6s' }} />
          <span>{autoRotate ? 'Đang xoay' : 'Dừng xoay'}</span>
        </button>
      </div>

      {/* Floating Hover Card for Character or Tree Ornament */}
      {hoveredTarget && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all transform animate-bounce">
          {hoveredTarget.kind === 'character' ? (
            <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-amber-400 text-white px-5 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-3">
              <img
                src={hoveredTarget.participant.avatar}
                alt={hoveredTarget.participant.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-inner"
              />
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Nhân vật 3D Mini: {hoveredTarget.participant.name}</span>
                </div>
                <div className="text-xs font-medium text-slate-200">
                  {hoveredTarget.participant.hasGiven ? (
                    <span className="text-emerald-400 font-semibold">✓ Đã hoàn thành trao quà</span>
                  ) : hoveredTarget.participant.id === selectedGiver?.id ? (
                    <span className="text-amber-400 font-bold">★ Đang trên sân khấu chọn quà!</span>
                  ) : (
                    <span className="text-white font-bold">👉 Nhấn vào nhân vật này để chọn người tặng quà!</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-amber-400 text-white px-5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-inner"
                style={{ backgroundColor: hoveredTarget.item.color || '#ef4444' }}
              >
                <Gift className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  <span>Mã Bí Mật: {hoveredTarget.item.code}</span>
                  <span className="text-[10px] bg-red-600/60 px-1.5 py-0.5 rounded text-white">{hoveredTarget.item.score}</span>
                </div>
                <div className="text-sm font-bold text-white tracking-wide">
                  {hoveredTarget.isOpened ? 'Đã được mở trước đó' : '✨ Nhấn để mở món quà này!'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Accessible Tray (Click to select alternative) */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 z-10 pointer-events-auto">
        <span className="text-[11px] text-slate-400 hidden sm:inline whitespace-nowrap bg-black/40 px-2 py-1 rounded">
          Chọn nhanh quà:
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
