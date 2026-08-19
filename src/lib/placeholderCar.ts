/**
 * Procedurally generated Formula Student car — the hero's stand-in until the
 * real CAD export exists.
 *
 * WHY THIS EXISTS
 * We have no CAD export and no renders, but the hero has to work today. Rather
 * than download a third-party model whose licence we would have to take on
 * trust, this builds a recognisable open-wheel single-seater out of three.js
 * primitives. It is our own geometry: no licence question, nothing to
 * attribute, nothing to remove later.
 *
 * WHAT IT IS AND IS NOT
 * It is not photoreal and is not trying to be. It IS proportioned like a real
 * Formula Student car and painted in the team's livery, because the first
 * thing a prospective sponsor sees should read as *our* car rather than as a
 * generic low-poly placeholder. Credibility is most of the job here.
 *
 * PROPORTIONS (metres, and they matter — these are FS numbers, not F1)
 *   overall length   3.00      wheelbase        1.55
 *   overall width    1.40      front track      1.20
 *   tyre diameter    0.457 (18in, on a 10in rim — the standard FS size)
 *   tyre width       0.152 (6in)
 * The driver cell sits back behind the front axle and the nose tapers forward
 * from the front bulkhead, which is the silhouette that reads as "formula car"
 * more than any other single cue.
 *
 * BUDGET: under 2,000 triangles. Verified on every render by
 * scripts/render-hero-frames.mjs, which counts them and fails if the budget is
 * breached — this model is lazy-loaded but it still has to stay cheap.
 *
 * IMPORTANT: this module takes `THREE` as an argument instead of importing it.
 * That keeps it framework-agnostic so the same source builds the car in the
 * live preview (Mode B), in the headless Playwright renderer that bakes the
 * frame sequence, and in any future test — without three.js being pulled into
 * a bundle that does not want it.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- THREE is injected by
   the caller so this module stays importable without a three.js dependency;
   the shapes used here are a stable, tiny subset of its API. */

type ThreeLike = any;

export type PlaceholderCarOptions = {
  /** Bodywork. Defaults to KUFS Navy. */
  bodyColor?: string;
  /** Wings, floor and structural detail. Defaults to the deep navy ground. */
  trimColor?: string;
  /** Wing endplates and livery highlight. Defaults to Performance Orange. */
  accentColor?: string;
};

/** Mirrors src/styles/tokens.css. Keep in step when the palette changes. */
const KUFS = {
  navy: "#25225e",
  deep: "#16143c",
  red: "#ac2a26",
  copper: "#df964e",
  orange: "#edad55",
  rim: "#c9cede",
  tyre: "#0e0d1f",
  glass: "#0a0918",
} as const;

/* Dimensions, in metres. */
const WHEELBASE = 1.55;
const FRONT_AXLE = WHEELBASE / 2;
const REAR_AXLE = -WHEELBASE / 2;
const TYRE_R = 0.2286;
const TYRE_W = 0.152;
const RIM_R = 0.127;
const FRONT_TRACK = 1.2;
const REAR_TRACK = 1.15;
const RIDE_HEIGHT = 0.04;

/**
 * Builds the car and returns it as a THREE.Group centred on the origin, with
 * the tyres sitting on y = 0 and the car pointing down +X.
 */
export function buildPlaceholderCar(
  THREE: ThreeLike,
  options: PlaceholderCarOptions = {},
): ThreeLike {
  const bodyColor = options.bodyColor ?? KUFS.navy;
  const trimColor = options.trimColor ?? KUFS.deep;
  const accentColor = options.accentColor ?? KUFS.orange;

  const car = new THREE.Group();
  car.name = "PlaceholderCar";

  const material = (color: string, metalness: number, roughness: number) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness,
      roughness,
    });

  const body = material(bodyColor, 0.3, 0.38);
  const trim = material(trimColor, 0.45, 0.5);
  const accent = material(accentColor, 0.35, 0.4);
  const stripeRed = material(KUFS.red, 0.3, 0.45);
  const stripeCopper = material(KUFS.copper, 0.35, 0.42);
  const rubber = material(KUFS.tyre, 0.05, 0.92);
  const rim = material(KUFS.rim, 0.85, 0.28);
  const glass = material(KUFS.glass, 0.2, 0.25);

  /** Add a mesh at a position, with optional rotation, and return it. */
  const add = (
    geometry: ThreeLike,
    mat: ThreeLike,
    [x, y, z]: [number, number, number],
    rotation?: [number, number, number],
    parent: ThreeLike = car,
  ) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  /* ---------------------------------------------------------------------
     FLOOR — a full-length plank the whole car sits on. Flat, wide and dark,
     it is what visually plants the car on the ground.
     --------------------------------------------------------------------- */
  add(box(2.45, 0.03, 0.86), trim, [0.05, RIDE_HEIGHT + 0.015, 0]);

  /* ---------------------------------------------------------------------
     SURVIVAL CELL — three stacked sections, narrowing and dropping forward.
     A single box reads as a brick; the step from cockpit to bulkhead to nose
     is what gives the car a waist.
     --------------------------------------------------------------------- */
  // Cockpit section, widest, behind the front axle.
  add(box(0.95, 0.3, 0.56), body, [-0.12, 0.3, 0]);
  // Front bulkhead section, narrower, sloping forward.
  add(box(0.62, 0.24, 0.44), body, [0.5, 0.29, 0], [0, 0, -0.05]);
  // Engine bay behind the driver, tapering to the rear.
  add(box(0.72, 0.34, 0.46), body, [-0.78, 0.34, 0], [0, 0, 0.04]);
  // Gearbox / rear structure.
  add(box(0.3, 0.2, 0.28), trim, [-1.18, 0.31, 0]);

  /* ---------------------------------------------------------------------
     NOSE CONE — tapering forward from the bulkhead to the impact attenuator.
     A 4-sided cone reads as a faceted composite nose rather than a spike.
     --------------------------------------------------------------------- */
  // Rotating -90° about Z lays the cylinder's local +Y along the car's +X, so
  // after the rotation local X is height and local Z is width. Six sides, so
  // the facet orientation reads the same from any angle in the orbit.
  const nose = add(
    new THREE.CylinderGeometry(0.19, 0.07, 0.64, 6, 1),
    body,
    [1.06, 0.26, 0],
    [0, 0, -Math.PI / 2],
  );
  nose.scale.set(0.82, 1, 0.95);
  // Impact attenuator at the tip.
  add(box(0.12, 0.1, 0.14), trim, [1.42, 0.25, 0]);

  /* ---------------------------------------------------------------------
     COCKPIT — opening, headrest, and a helmet the driver can be read into.
     The helmet is the single cheapest cue that this is a car with a person
     in it, which is most of what separates "race car" from "wedge".
     --------------------------------------------------------------------- */
  add(box(0.6, 0.06, 0.4), glass, [0.02, 0.45, 0]);
  // Headrest behind the driver.
  add(box(0.12, 0.18, 0.34), trim, [-0.38, 0.52, 0]);
  // Helmet.
  const helmet = add(new THREE.SphereGeometry(0.125, 10, 6), accent, [-0.16, 0.56, 0]);
  helmet.scale.set(1.08, 1, 1);
  // Visor band.
  add(box(0.06, 0.055, 0.2), glass, [-0.06, 0.575, 0]);

  /* ---------------------------------------------------------------------
     ROLL STRUCTURE — main hoop behind the driver, front hoop ahead. Kept as
     low-segment torus arcs; at hero scale the facets do not read.
     --------------------------------------------------------------------- */
  add(
    new THREE.TorusGeometry(0.28, 0.028, 4, 10, Math.PI),
    trim,
    [-0.42, 0.5, 0],
    [0, Math.PI / 2, 0],
  );
  add(
    new THREE.TorusGeometry(0.21, 0.024, 4, 8, Math.PI),
    trim,
    [0.36, 0.44, 0],
    [0, Math.PI / 2, 0],
  );
  // Hoop bracing back to the engine bay.
  for (const z of [-0.2, 0.2]) {
    add(box(0.5, 0.03, 0.03), trim, [-0.68, 0.6, z], [0, 0, 0.42]);
  }

  /* ---------------------------------------------------------------------
     SIDEPODS — with a radiator inlet at the front face, and the KUFS speed
     stripe raking down the outer flank. The stripe is the whole reason this
     reads as our car rather than a generic placeholder.
     --------------------------------------------------------------------- */
  for (const side of [-1, 1]) {
    const z = side * 0.42;

    // Pod body, tapering rearward.
    add(box(0.86, 0.26, 0.3), body, [-0.14, 0.26, z]);
    // Inlet mouth, recessed and dark.
    add(box(0.05, 0.2, 0.24), glass, [0.31, 0.26, z]);
    // Inlet surround.
    add(box(0.04, 0.24, 0.29), trim, [0.28, 0.26, z]);

    // Speed stripe: three bars raking down toward the rear of the pod,
    // running red -> copper -> orange, exactly as in the logo lockup.
    const stripeZ = z + side * 0.152;
    const stripes: [ThreeLike, number, number][] = [
      [stripeRed, 0.34, 0.0],
      [stripeCopper, 0.3, -0.035],
      [accent, 0.26, -0.07],
    ];
    for (const [mat, y, drop] of stripes) {
      add(box(0.66, 0.028, 0.006), mat, [-0.16, y + drop, stripeZ], [0, 0, -0.06]);
    }
  }

  /* ---------------------------------------------------------------------
     FRONT WING — two elements plus endplates. Multi-element, cambered by
     rotation, so it reads as a wing rather than a shelf.
     --------------------------------------------------------------------- */
  add(box(0.26, 0.018, 1.32), trim, [1.28, 0.1, 0], [0, 0, 0.06]);
  add(box(0.19, 0.016, 1.26), trim, [1.09, 0.15, 0], [0, 0, 0.2]);
  for (const z of [-0.66, 0.66]) {
    add(box(0.38, 0.17, 0.02), accent, [1.22, 0.14, z]);
  }
  // Nose-to-wing pylons.
  for (const z of [-0.12, 0.12]) {
    add(box(0.16, 0.12, 0.025), trim, [1.3, 0.17, z]);
  }

  /* ---------------------------------------------------------------------
     REAR WING — three elements on twin pylons, high and set back. The single
     most recognisable feature of an FS car from behind.
     --------------------------------------------------------------------- */
  const rearElements: [number, number, number, number][] = [
    // x, y, chord, rake
    [-1.3, 0.78, 0.3, 0.26],
    [-1.37, 0.88, 0.24, 0.34],
    [-1.42, 0.97, 0.19, 0.42],
  ];
  for (const [x, y, chord, rake] of rearElements) {
    add(box(chord, 0.02, 0.98), trim, [x, y, 0], [0, 0, rake]);
  }
  for (const z of [-0.5, 0.5]) {
    add(box(0.36, 0.29, 0.022), accent, [-1.36, 0.87, z]);
  }
  for (const z of [-0.15, 0.15]) {
    add(box(0.05, 0.44, 0.03), trim, [-1.24, 0.6, z]);
  }
  // Rear crash structure under the wing.
  add(box(0.22, 0.12, 0.2), trim, [-1.3, 0.34, 0]);

  /* ---------------------------------------------------------------------
     WHEELS — 18in tyres on 10in rims, the standard FS size. Wishbones are
     suggested with thin bars; at hero distance that is enough to stop the
     corners looking hollow.
     --------------------------------------------------------------------- */
  const corners: [number, number][] = [
    [FRONT_AXLE, FRONT_TRACK / 2],
    [FRONT_AXLE, -FRONT_TRACK / 2],
    [REAR_AXLE, REAR_TRACK / 2],
    [REAR_AXLE, -REAR_TRACK / 2],
  ];

  const tyreGeometry = new THREE.CylinderGeometry(TYRE_R, TYRE_R, TYRE_W, 14);
  const rimGeometry = new THREE.CylinderGeometry(RIM_R, RIM_R, TYRE_W + 0.01, 10);

  for (const [x, z] of corners) {
    const side = Math.sign(z);
    add(tyreGeometry, rubber, [x, TYRE_R, z], [Math.PI / 2, 0, 0]);
    add(rimGeometry, rim, [x, TYRE_R, z], [Math.PI / 2, 0, 0]);

    // Upper and lower wishbones, angled inboard.
    const inboardZ = side * 0.24;
    const span = Math.abs(z - inboardZ);
    add(
      box(0.03, 0.025, span),
      trim,
      [x + 0.1, TYRE_R + 0.1, (z + inboardZ) / 2],
      [0, 0, 0],
    );
    add(box(0.03, 0.025, span), trim, [x - 0.08, TYRE_R - 0.09, (z + inboardZ) / 2]);
    // Pushrod.
    add(box(0.02, 0.24, 0.02), trim, [x - 0.02, TYRE_R + 0.02, z * 0.7], [0.5, 0, 0]);
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
  // the closest the camera gets — but never so close that the 3.0 m car
  // overflows a 16:9 frame at 32° FOV.
  const radius = 5.35 - 0.3 * Math.sin(Math.PI * eased);
  const height = 0.62 + 1.25 * eased;

  return {
    position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
    // Framed slightly above the car's centre of mass, which keeps the subject
    // off the bottom of the frame without stranding it under dead sky.
    target: [0, 0.44 + 0.1 * eased, 0],
  };
}
