// 3D-globen. Beslut 1: allt ritas först på ekvirektangulära bilder (canvas)
// som sedan läggs på klotet. Samma bilder kan skickas till en fysisk glob.
//   baseCanvas    – grundkartan (hav, gradnät, land), ritas en gång
//   overlayCanvas – lagrens bild, ritas om när året ändras
// Klickbara markörer och bågar ligger som 3D-objekt ovanpå.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export { THREE };
export const R = 1;
const DEG = Math.PI / 180;

/** Latitud/longitud till punkt på klotet, i samma system som klotets bildkoordinater. */
export function latLonToVec3(lat, lon, r = R) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

export class Globe {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.zoom = 1;
    this.viewShiftPx = 0;

    this.group = new THREE.Group();
    this.group.rotation.order = 'XYZ';
    this.scene.add(this.group);

    // Ekvirektangulära bilder
    this.baseCanvas = document.createElement('canvas');
    this.baseCanvas.width = 4096; this.baseCanvas.height = 2048;
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.width = 4096; this.overlayCanvas.height = 2048;

    this.baseTex = new THREE.CanvasTexture(this.baseCanvas);
    this.baseTex.colorSpace = THREE.SRGBColorSpace;
    this.baseTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.overlayTex = new THREE.CanvasTexture(this.overlayCanvas);
    this.overlayTex.colorSpace = THREE.SRGBColorSpace;
    this.overlayTex.anisotropy = this.baseTex.anisotropy;

    const sphere = new THREE.SphereGeometry(R, 128, 64);
    this.baseMesh = new THREE.Mesh(sphere, new THREE.MeshLambertMaterial({ map: this.baseTex }));
    this.overlayMesh = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.002, 128, 64),
      new THREE.MeshBasicMaterial({ map: this.overlayTex, transparent: true, depthWrite: false }),
    );
    this.group.add(this.baseMesh, this.overlayMesh);

    // Atmosfär: svagt sken runt kanten
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.12, 64, 32),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, transparent: true, depthWrite: false,
        uniforms: { c: { value: new THREE.Color('#7fa6c9') } },
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(c, clamp(i,0.0,1.0)*0.55); }',
      }),
    );
    this.scene.add(atmo);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xfff3dd, 1.4);
    sun.position.set(-2, 2, 3);
    this.scene.add(sun);

    this.markerGroup = new THREE.Group();
    this.arcGroup = new THREE.Group();
    this.group.add(this.markerGroup, this.arcGroup);

    this.raycaster = new THREE.Raycaster();
    this.frameCallbacks = [];
    this.autoRotate = true;
    this._vel = { x: 0, y: 0 };
    this._fly = null;

    this.group.rotation.set(0.35, 0, 0);
    this._initControls();
    this._resize();
    new ResizeObserver(() => this._resize()).observe(canvas);
    this.renderer.setAnimationLoop(t => this._tick(t));
  }

  // ---------- Grundkarta ----------
  drawBase(land) {
    const c = this.baseCanvas, ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;

    const sea = ctx.createLinearGradient(0, 0, 0, H);
    sea.addColorStop(0, '#1b3b55'); sea.addColorStop(0.5, '#15354f'); sea.addColorStop(1, '#1b3b55');
    ctx.fillStyle = sea; ctx.fillRect(0, 0, W, H);

    // Gradnät var 15:e grad
    ctx.strokeStyle = 'rgba(214,190,140,0.16)'; ctx.lineWidth = 1.5;
    for (let lon = -180; lon <= 180; lon += 15) { ctx.beginPath(); ctx.moveTo(X(lon), 0); ctx.lineTo(X(lon), H); ctx.stroke(); }
    for (let lat = -75; lat <= 75; lat += 15) { ctx.beginPath(); ctx.moveTo(0, Y(lat)); ctx.lineTo(W, Y(lat)); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(214,176,106,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(W, Y(0)); ctx.stroke();

    // Land: färdigprojicerad path (klippt vid datumlinjen) i 4096x2048
    const path = new Path2D(land.path);
    ctx.save();
    ctx.scale(W / land.width, H / land.height);
    ctx.fillStyle = '#cdb88d';
    ctx.fill(path);
    ctx.strokeStyle = 'rgba(80,58,25,0.55)'; ctx.lineWidth = 1.6;
    ctx.stroke(path);
    ctx.restore();
    this.baseTex.needsUpdate = true;
  }

  overlayContext() {
    const ctx = this.overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    return ctx;
  }
  commitOverlay() { this.overlayTex.needsUpdate = true; }

  /** Lägger ihop grundkarta och lager till den platta bild en fysisk glob skulle få. */
  composeFlat(target) {
    target.width = 4096; target.height = 2048;
    const ctx = target.getContext('2d');
    ctx.drawImage(this.baseCanvas, 0, 0, 4096, 2048);
    ctx.drawImage(this.overlayCanvas, 0, 0, 4096, 2048);
  }

  // ---------- Bågar mellan samtidiga platser ----------
  setArcs(pairs) {
    for (const ch of [...this.arcGroup.children]) { ch.geometry.dispose(); ch.material.dispose(); this.arcGroup.remove(ch); }
    for (const [a, b] of pairs) {
      const va = latLonToVec3(a[0], a[1]).normalize(), vb = latLonToVec3(b[0], b[1]).normalize();
      const ang = va.angleTo(vb);
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const s = i / 96;
        const v = slerp(va, vb, s, ang);
        v.multiplyScalar(R * (1.006 + Math.sin(Math.PI * s) * Math.min(0.16, ang * 0.1)));
        pts.push(v);
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xf1dfb4, transparent: true, opacity: 0.9 }),
      );
      this.arcGroup.add(line);
    }
  }

  // ---------- Kamera och styrning ----------
  setViewShift(px) { this.viewShiftPx = px; this._resize(); }

  _resize() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    if (this.viewShiftPx) this.camera.setViewOffset(w, h, this.viewShiftPx, 0, w, h);
    else this.camera.clearViewOffset();
    const fit = R * 1.32 / Math.tan(this.camera.fov / 2 * DEG);
    this.baseDist = this.camera.aspect < 1 ? fit / this.camera.aspect : fit;
    // Lämna plats för tidslinjen nedtill
    this.camera.position.set(0, -0.06, this.baseDist / this.zoom);
    this.camera.lookAt(0, -0.06, 0);
    this.camera.updateProjectionMatrix();
  }

  setZoom(z) {
    this.zoom = Math.min(3.2, Math.max(0.8, z));
    this.camera.position.z = this.baseDist / this.zoom;
    this.onZoom?.(this.zoom);
  }

  flyTo(lat, lon, ms = 1100) {
    const theta = (lon + 180) * DEG;
    let ty = Math.PI / 2 - theta;
    const cy = this.group.rotation.y;
    ty = cy + wrapPi(ty - cy);
    const tx = Math.max(-1.25, Math.min(1.25, lat * DEG));
    this.autoRotate = false;
    this._vel = { x: 0, y: 0 };
    this._fly = { t0: performance.now(), ms, fx: this.group.rotation.x, fy: cy, tx, ty };
  }

  _initControls() {
    const el = this.canvas;
    const pts = new Map();
    let last = null, moved = 0, pinch0 = 0, zoom0 = 1;
    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      moved = 0;
      this.autoRotate = false; this._fly = null;
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = this.zoom; }
      el.classList.add('dragging');
    });
    el.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        this.setZoom(zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / (pinch0 || 1));
        moved += 10; return;
      }
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      const k = 0.0042 / this.zoom;
      this.group.rotation.y += dx * k;
      this.group.rotation.x = Math.max(-1.25, Math.min(1.25, this.group.rotation.x + dy * k));
      const now = performance.now(), dt = Math.max(8, now - last.t);
      this._vel = { x: dy * k / dt * 16, y: dx * k / dt * 16 };
      last = { x: e.clientX, y: e.clientY, t: now };
    });
    const end = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      el.classList.remove('dragging');
      if (moved < 6 && e.type === 'pointerup' && this.onClick) this.onClick(e.clientX, e.clientY);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    // Tangentbord (#139): piltangenter snurrar, + och − zoomar. Rör inte tangenter med modifierare.
    el.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const step = (e.shiftKey ? 0.24 : 0.1) / this.zoom;
      let handled = true;
      if (e.key === 'ArrowLeft') this.group.rotation.y += step;
      else if (e.key === 'ArrowRight') this.group.rotation.y -= step;
      else if (e.key === 'ArrowUp') this.group.rotation.x = Math.max(-1.25, Math.min(1.25, this.group.rotation.x + step));
      else if (e.key === 'ArrowDown') this.group.rotation.x = Math.max(-1.25, Math.min(1.25, this.group.rotation.x - step));
      else if (e.key === '+' || e.key === '=') this.setZoom(this.zoom * 1.2);
      else if (e.key === '-' || e.key === '_') this.setZoom(this.zoom / 1.2);
      else handled = false;
      if (!handled) return;
      e.preventDefault();
      this.autoRotate = false; this._fly = null; this._vel = { x: 0, y: 0 };
    });
    el.addEventListener('wheel', e => { e.preventDefault(); this.setZoom(this.zoom * Math.exp(-e.deltaY * 0.0012)); }, { passive: false });
  }

  /** Skärmposition för en punkt i klotets koordinater, och om den syns (vänd mot kameran). */
  project(local) {
    const world = local.clone().applyMatrix4(this.group.matrixWorld);
    const toCam = this.camera.position.clone().sub(world).normalize();
    const facing = world.clone().normalize().dot(toCam);
    const p = world.clone().project(this.camera);
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, facing };
  }

  pick(clientX, clientY, objects) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(v, this.camera);
    const hits = this.raycaster.intersectObjects([this.baseMesh, ...objects], false);
    const first = hits[0];
    return first && first.object !== this.baseMesh ? first.object : null;
  }

  onFrame(cb) { this.frameCallbacks.push(cb); }

  _tick(t) {
    if (this._fly) {
      const f = this._fly, s = Math.min(1, (performance.now() - f.t0) / f.ms);
      const e = s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
      this.group.rotation.x = f.fx + (f.tx - f.fx) * e;
      this.group.rotation.y = f.fy + (f.ty - f.fy) * e;
      if (s >= 1) this._fly = null;
    } else if (this.autoRotate) {
      this.group.rotation.y += 0.0009;
    } else if (Math.abs(this._vel.x) + Math.abs(this._vel.y) > 1e-5) {
      this.group.rotation.y += this._vel.y;
      this.group.rotation.x = Math.max(-1.25, Math.min(1.25, this.group.rotation.x + this._vel.x));
      this._vel.x *= 0.92; this._vel.y *= 0.92;
    }
    this.group.updateMatrixWorld();
    for (const cb of this.frameCallbacks) cb(t);
    this.renderer.render(this.scene, this.camera);
  }
}

function wrapPi(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
function slerp(a, b, s, ang) {
  if (ang < 1e-6) return a.clone();
  const sa = Math.sin(ang);
  return a.clone().multiplyScalar(Math.sin((1 - s) * ang) / sa).add(b.clone().multiplyScalar(Math.sin(s * ang) / sa));
}
