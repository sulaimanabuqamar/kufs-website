/**
 * The hero's 3D scene, defined once.
 *
 * Both consumers build the scene through this module:
 *   1. Mode B — the live three.js preview in the browser
 *   2. scripts/render-hero-frames.mjs — headless Chromium, baking the WebP
 *      sequence that Mode A plays back
 *
 * That is the point. When the real CAD export lands, one command regenerates
 * the production frames and they are guaranteed to match what the preview
 * shows, because there is only one lighting rig and one camera path.
 *
 * As with placeholderCar.ts, `THREE` is injected rather than imported so this
 * file can be evaluated in a bare browser page by the render script without a
 * bundler.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- injected THREE; see above. */

import { buildPlaceholderCar, cameraPoseAt } from "@/lib/placeholderCar";

type ThreeLike = any;

export type HeroSceneHandle = {
  /** The car itself, exposed so the frame renderer can count its triangles
   *  and enforce the model budget. */
  subject: ThreeLike;
  /** Move the camera to the pose for scroll progress 0..1 and draw. */
  setProgress: (progress: number) => void;
  /** Re-fit the renderer and camera to a new canvas size. */
  resize: (width: number, height: number) => void;
  /** Release GPU resources. */
  dispose: () => void;
};

export type CreateHeroSceneOptions = {
  THREE: ThreeLike;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  dpr?: number;
  /** Background colour. Must match --color-bg or the hero seams visibly. */
  background?: string;
  /** Optional GLB. When omitted, the procedural placeholder car is used. */
  model?: ThreeLike | null;
};

/** Field of view, kept in one place so preview and bake cannot diverge. */
const FOV = 32;

/** How far right of centre the car sits, as a fraction of frame width. */
const SUBJECT_OFFSET_X = 0.17;

export function createHeroScene({
  THREE,
  canvas,
  width,
  height,
  dpr = 1,
  background = "#16143c",
  model = null,
}: CreateHeroSceneOptions): HeroSceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  // Fog hides the edge of the ground disc without needing a bigger disc.
  scene.fog = new THREE.Fog(new THREE.Color(background), 7.5, 16);

  const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 100);

  /**
   * Push the subject right of centre.
   *
   * The hero's headline occupies the left of the frame, so a centred car
   * would sit underneath it and force a scrim heavy enough to hide the car
   * entirely. Offsetting the frustum moves the car into the empty right-hand
   * side instead — the composition is designed around the copy rather than
   * fought with opacity. Applied here so the baked frames, the poster and the
   * live preview all share it.
   */
  const applyViewOffset = (w: number, h: number) => {
    camera.setViewOffset(w, h, -w * SUBJECT_OFFSET_X, 0, w, h);
  };
  applyViewOffset(width, height);

  // --- Lighting: a three-point studio rig ---------------------------------
  //
  // Tuned for a NAVY car on a navy ground, which is a much harder lighting
  // problem than the red placeholder it replaced: with the old rig the
  // bodywork sank into the background entirely. The key is brighter and
  // further round to the front-left, and both rims are stronger, so the car is
  // read by its lit edges rather than by its silhouette.
  scene.add(new THREE.HemisphereLight(0xcfdcf2, 0x1a1745, 0.75));

  const key = new THREE.DirectionalLight(0xfff4e8, 4.2);
  // Front-left and high — lights the nose, the near sidepod and the helmet.
  key.position.set(5.2, 6.2, 4.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 22;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.bias = -0.0009;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  // Warm rim from behind in Performance Orange, picking out the rear wing and
  // roll hoop silhouette against the background.
  // Kept deliberately restrained and raised well above the horizon: a strong
  // low warm light from behind reads beautifully on the car and floods the
  // floor orange, which turned the studio into a desert.
  const rimWarm = new THREE.DirectionalLight(0xedad55, 1.35);
  rimWarm.position.set(-4.4, 5.2, -3.0);
  scene.add(rimWarm);

  // Cool fill from the opposite side so the shadow flank still has form
  // instead of going flat black.
  const rimCool = new THREE.DirectionalLight(0x8fbcff, 1.25);
  rimCool.position.set(-2.2, 2.6, 5.2);
  scene.add(rimCool);

  // Low bounce standing in for light coming back off the floor.
  const bounce = new THREE.DirectionalLight(0xa9b6e8, 0.35);
  bounce.position.set(1.5, -2, 1.5);
  scene.add(bounce);

  // --- Ground --------------------------------------------------------------
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(11, 48),
    new THREE.MeshStandardMaterial({
      // Darker than the background so the car separates from the floor and
      // the contact shadow still reads.
      color: new THREE.Color("#100e2c"),
      roughness: 0.68,
      metalness: 0.2,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // --- Subject -------------------------------------------------------------
  const car = model ?? buildPlaceholderCar(THREE);

  if (model) {
    // Normalise an arbitrary GLB to the same footprint the placeholder uses,
    // so the camera path stays valid whatever gets dropped in. Target: 2.9 m
    // long, sitting on the ground, centred on the origin, pointing down +X.
    const box = new THREE.Box3().setFromObject(car);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const scale = 2.9 / Math.max(size.x, size.z, 0.001);

    car.scale.setScalar(scale);
    car.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);

    car.traverse((child: ThreeLike) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  scene.add(car);

  // --- Camera driving ------------------------------------------------------
  const target = new THREE.Vector3();

  const setProgress = (progress: number) => {
    const pose = cameraPoseAt(progress);
    camera.position.set(pose.position[0], pose.position[1], pose.position[2]);
    target.set(pose.target[0], pose.target[1], pose.target[2]);
    camera.lookAt(target);
    renderer.render(scene, camera);
  };

  const resize = (nextWidth: number, nextHeight: number) => {
    camera.aspect = nextWidth / nextHeight;
    applyViewOffset(nextWidth, nextHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight, false);
  };

  const dispose = () => {
    scene.traverse((object: ThreeLike) => {
      if (object.geometry) object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) material.forEach((m: ThreeLike) => m.dispose());
      else if (material) material.dispose();
    });
    renderer.dispose();
  };

  setProgress(0);

  return { subject: car, setProgress, resize, dispose };
}
