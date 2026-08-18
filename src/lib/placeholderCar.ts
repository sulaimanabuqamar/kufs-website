/**
 * Procedurally generated low-poly open-wheel car.
 *
 * WHY THIS EXISTS
 * We have no CAD export and no renders yet, but the hero has to work today.
 * Rather than download a third-party model whose licence we would have to
 * take on trust, this builds a recognisable open-wheel single-seater out of
 * three.js primitives. It is our own geometry, so there is no licence
 * question to answer, nothing to attribute, and nothing to remove later.
 *
 * It is deliberately stylised — a matte studio object, not an attempt at
 * photorealism. A crude model that is obviously a placeholder is more useful
 * than a good one that someone mistakes for the real car.
 *
 * SHAPE
 * Proportions follow a Formula Student car rather than an F1 car: a short
 * 1550 mm wheelbase, high-ish nose, prominent sidepods, and a large rear wing
 * relative to the body. Units are metres.
 *
 * IMPORTANT: this module takes `THREE` as an argument instead of importing
 * it. That keeps it framework-agnostic so the exact same source builds the
 * car in three places — the live preview (Mode B), the headless Playwright
 * renderer that bakes the frame sequence, and any future test — without
 * three.js being pulled into a bundle that does not want it.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- THREE is injected by
   the caller so this module stays importable without a three.js dependency;
   the shapes used here are a stable, tiny subset of its API. */

type ThreeLike = any;

export type PlaceholderCarOptions = {
  /** Body colour. Defaults to the brand accent from tokens.css. */
  bodyColor?: string;
  /** Secondary colour for wings, floor and roll hoop. */
  trimColor?: string;
};

const DEFAULTS = {
  // Racing Red bodywork with KUFS Navy trim — the livery the real car will
  // carry. Red is fine here: this is a lit three-dimensional object, not flat
  // UI colour on a flat surface, so the 2.12:1 flat-contrast problem does not
  // apply. Nothing in this scene carries text or meaning.
  bodyColor: "#ac2a26",
  trimColor: "#16143c",
} as const;

/**
 * Builds the car and returns it as a THREE.Group centred on the origin, with
 * the wheels sitting on y = 0 and the car pointing down +X.
 */
export function buildPlaceholderCar(
  THREE: ThreeLike,
  options: PlaceholderCarOptions = {},
): ThreeLike {
  const bodyColor = options.bodyColor ?? DEFAULTS.bodyColor;
  const trimColor = options.trimColor ?? DEFAULTS.trimColor;

  const car = new THREE.Group();
  car.name = "PlaceholderCar";

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(bodyColor),
    metalness: 0.25,
    roughness: 0.42,
  });

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(trimColor),
    metalness: 0.35,
    roughness: 0.55,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#edad55"),
    metalness: 0.3,
    roughness: 0.45,
  });

  const tyreMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#101215"),
    metalness: 0.05,
    roughness: 0.85,
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#cbd2dc"),
    metalness: 0.85,
    roughness: 0.3,
  });

  const add = (mesh: ThreeLike, x: number, y: number, z: number) => {
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    car.add(mesh);
    return mesh;
  };

  // --- Survival cell / main body ------------------------------------------
  // A tapered box: wide at the cockpit, narrow toward the nose.
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.34, 0.62), bodyMaterial);
  add(body, 0.05, 0.34, 0);

  // Engine cover behind the cockpit, sloping down to the rear.
  const engineCover = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.16, 0.9, 8),
    bodyMaterial,
  );
  engineCover.rotation.z = Math.PI / 2;
  add(engineCover, -0.72, 0.5, 0);

  // --- Nose cone -----------------------------------------------------------
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.85, 6), bodyMaterial);
  nose.rotation.z = -Math.PI / 2;
  add(nose, 1.42, 0.33, 0);

  // Impact attenuator tip.
  const noseTip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.2), trimMaterial);
  add(noseTip, 1.86, 0.3, 0);

  // --- Cockpit opening -----------------------------------------------------
  const cockpit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.2, 0.5, 10, 1, true),
    trimMaterial,
  );
  cockpit.rotation.z = Math.PI / 2;
  add(cockpit, 0.35, 0.53, 0);

  // Main roll hoop — the visual signature of a formula car.
  const rollHoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.035, 6, 12, Math.PI),
    trimMaterial,
  );
  rollHoop.rotation.y = Math.PI / 2;
  add(rollHoop, -0.18, 0.6, 0);

  // Front hoop, shorter, ahead of the driver.
  const frontHoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.03, 6, 12, Math.PI),
    trimMaterial,
  );
  frontHoop.rotation.y = Math.PI / 2;
  add(frontHoop, 0.72, 0.5, 0);

  // --- Sidepods ------------------------------------------------------------
  for (const z of [-0.46, 0.46]) {
    const sidepod = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.26, 0.28), bodyMaterial);
    add(sidepod, -0.12, 0.3, z);

    // Radiator inlet face.
    const inlet = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.24), trimMaterial);
    add(inlet, 0.36, 0.3, z);
  }

  // --- Floor ---------------------------------------------------------------
  const floor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.04, 1.15), trimMaterial);
  add(floor, 0.05, 0.13, 0);

  // --- Front wing ----------------------------------------------------------
  const frontWingMain = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.03, 1.3),
    trimMaterial,
  );
  add(frontWingMain, 1.78, 0.16, 0);

  const frontWingFlap = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.03, 1.24),
    trimMaterial,
  );
  frontWingFlap.rotation.z = 0.22;
  add(frontWingFlap, 1.58, 0.24, 0);

  for (const z of [-0.65, 0.65]) {
    const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.26, 0.03), bodyMaterial);
    add(endplate, 1.7, 0.24, z);
  }

  // --- Rear wing -----------------------------------------------------------
  // Three elements, stacked and staggered, on twin pylons.
  const rearWingElements: [number, number, number][] = [
    [-1.36, 0.78, 0.34],
    [-1.44, 0.9, 0.28],
    [-1.5, 1.0, 0.22],
  ];

  for (const [x, y, chord] of rearWingElements) {
    const element = new THREE.Mesh(
      new THREE.BoxGeometry(chord, 0.025, 1.1),
      trimMaterial,
    );
    element.rotation.z = 0.3;
    add(element, x, y, 0);
  }

  for (const z of [-0.55, 0.55]) {
    const endplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.42, 0.025),
      accentMaterial,
    );
    add(endplate, -1.42, 0.88, z);
  }

  for (const z of [-0.16, 0.16]) {
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.04), trimMaterial);
    add(pylon, -1.3, 0.6, z);
  }

  // --- Wheels --------------------------------------------------------------
  // 10-inch rims with a fat sidewall, as run in FS.
  const TYRE_RADIUS = 0.26;
  const TYRE_WIDTH = 0.2;

  const wheelPositions: [number, number][] = [
    [0.85, -0.62],
    [0.85, 0.62],
    [-0.7, -0.62],
    [-0.7, 0.62],
  ];

  for (const [x, z] of wheelPositions) {
    const wheel = new THREE.Group();

    const tyre = new THREE.Mesh(
      new THREE.CylinderGeometry(TYRE_RADIUS, TYRE_RADIUS, TYRE_WIDTH, 16),
      tyreMaterial,
    );
    tyre.rotation.x = Math.PI / 2;
    tyre.castShadow = true;
    wheel.add(tyre);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, TYRE_WIDTH + 0.012, 12),
      rimMaterial,
    );
    rim.rotation.x = Math.PI / 2;
    wheel.add(rim);

    wheel.position.set(x, TYRE_RADIUS, z);
    car.add(wheel);

    // Wishbones, suggested with two thin bars per corner.
    const inboardZ = Math.sign(z) * 0.28;
    for (const [dx, dy] of [
      [0.16, 0.34],
      [-0.16, 0.16],
    ] as [number, number][]) {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.03, Math.abs(z - inboardZ)),
        trimMaterial,
      );
      add(arm, x + dx, dy, (z + inboardZ) / 2);
    }
  }

  return car;
}

/**
 * Camera path for the hero.
 *
 * `progress` runs 0..1 across the pinned scroll track. The camera swings from
 * a low three-quarter front view, through a side profile, to a raised rear
 * three-quarter — the sequence a person walks when they see a car for the
 * first time.
 *
 * Shared by Mode B and by scripts/render-hero-frames.mjs, so the baked frame
 * sequence and the live preview are the same motion, not two approximations
 * of it. Change it here and both follow.
 */
export function cameraPoseAt(progress: number): {
  position: [number, number, number];
  target: [number, number, number];
} {
  const t = Math.min(1, Math.max(0, progress));

  // Ease so the ends settle rather than arriving at full speed.
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  // 200 degrees of orbit, starting front-right.
  const startAngle = -0.62;
  const sweep = Math.PI * 1.11;
  const angle = startAngle + sweep * eased;

  // Eases in slightly through the middle of the sweep so the side profile is
  // the closest the camera gets — but never so close that the 2.9 m car
  // overflows a 16:9 frame at 32° FOV.
  const radius = 5.15 - 0.3 * Math.sin(Math.PI * eased);
  const height = 0.75 + 1.3 * eased;

  return {
    position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
    // Framed slightly above the car's centre of mass, which keeps the subject
    // off the bottom of the frame without stranding it under dead sky.
    target: [0, 0.55 + 0.1 * eased, 0],
  };
}
