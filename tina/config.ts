import { defineConfig } from "tinacms";

import {
  COPY_SCHEMAS,
  carSchema,
  milestoneSchema,
  newsFrontmatterSchema,
  newsletterFrontmatterSchema,
  roleSchema,
  siteSchema,
  sponsorSchema,
  teamMemberSchema,
  tierSchema,
} from "../src/lib/schemas";

import {
  becomeASponsorCopyOverlay,
  carOverlay,
  commonCopyOverlay,
  contactCopyOverlay,
  homeCopyOverlay,
  joinCopyOverlay,
  newsCopyOverlay,
  newsletterCopyOverlay,
  notFoundCopyOverlay,
  pressKitCopyOverlay,
  progressCopyOverlay,
  sponsorsCopyOverlay,
  teamCopyOverlay,
  theCarCopyOverlay,
  milestoneOverlay,
  newsOverlay,
  newsletterOverlay,
  roleOverlay,
  siteOverlay,
  sponsorOverlay,
  teamOverlay,
  tierOverlay,
} from "./overlays";
import { fieldsFromZod } from "./zod-to-tina";

/**
 * TinaCMS — the committee's admin panel.
 *
 * Git-based: every save is a commit to this repository, so content stays as
 * files, the Zod schemas still validate it at build time, and a committee that
 * lets the Tina account lapse still has a working website and fully editable
 * content in git. Nothing here is a database.
 *
 * THE FIELDS ARE NOT WRITTEN HERE. They are compiled from `src/lib/schemas.ts`
 * by `tina/zod-to-tina.ts`, so Zod remains the single source of truth and
 * there is no second schema to keep in sync. What IS written here is the
 * overlay in `tina/overlays.ts`: labels, help text and widget choices, none of
 * which a type can know, and none of which can add or remove a field.
 *
 * GATING. `tinacms build` writes the admin SPA to `public/admin/`, which is
 * gitignored. If the Tina environment variables are not set, the build script
 * skips that step, the directory does not exist, and `/admin` 404s — the same
 * file-presence gate used for the licensed display font. There is no flag to
 * forget to flip and no way for a public route to import Tina, because the
 * admin is a separate single-page app rather than a Next route.
 */

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const token = process.env.TINA_TOKEN;

/* -------------------------------------------------------------------------
   Media
   ------------------------------------------------------------------------- */

/**
 * Uploads land in `public/uploads/` and commit alongside the content edit.
 *
 * The photo gap is the site's biggest remaining hole, so this has to be the
 * easy path. Note that `imageRef` in the Zod schema also requires width,
 * height and alt text: next/image needs the dimensions to reserve space (that
 * is the site's CLS budget), and alt text is not optional on a site that holds
 * accessibility at 100. Tina cannot measure an image for the editor, so those
 * three fields sit next to the picker with help text saying where to find them.
 */
const media = {
  tina: {
    mediaRoot: "uploads",
    publicFolder: "public",
  },
};

/* -------------------------------------------------------------------------
   Page copy
   -------------------------------------------------------------------------
   One collection per page, plus "Shared wording" for the header, footer, nav
   labels, forms and buttons.

   Mirroring the SITE rather than the component tree is deliberate: the person
   editing has the live page open in another tab and is looking for the page
   they can see. A single copy.json would have been one file to maintain and a
   panel nobody could navigate.

   Fields are compiled from the Zod schemas like everything else, so the length
   limits are enforced by the same rules that validate the build — an editor
   who pastes a paragraph into a heading is stopped by the panel, and if they
   get past it, by CI.
   ------------------------------------------------------------------------- */

const COPY_COLLECTIONS = [
  { name: "common", label: "Shared wording", overlay: commonCopyOverlay },
  { name: "home", label: "Home page", overlay: homeCopyOverlay },
  {
    name: "become-a-sponsor",
    label: "Become a Sponsor page",
    overlay: becomeASponsorCopyOverlay,
  },
  { name: "sponsors", label: "Sponsors page", overlay: sponsorsCopyOverlay },
  { name: "team", label: "Team page", overlay: teamCopyOverlay },
  { name: "the-car", label: "The Car page", overlay: theCarCopyOverlay },
  { name: "progress", label: "Progress page", overlay: progressCopyOverlay },
  { name: "news", label: "News page", overlay: newsCopyOverlay },
  { name: "newsletter", label: "Newsletter page", overlay: newsletterCopyOverlay },
  { name: "join", label: "Join the Team page", overlay: joinCopyOverlay },
  { name: "press-kit", label: "Press Kit page", overlay: pressKitCopyOverlay },
  { name: "contact", label: "Contact page", overlay: contactCopyOverlay },
  { name: "not-found", label: "Page-not-found page", overlay: notFoundCopyOverlay },
] as const;

const copyCollections = COPY_COLLECTIONS.map((entry) => ({
  name: `copy_${entry.name.replace(/-/g, "_")}`,
  label: entry.label,
  path: "content/copy",
  format: "json" as const,
  match: { include: entry.name },
  ui: {
    // One file each. An editor should never be able to create a second
    // home.json or delete the only one — the build reads these by name.
    allowedActions: { create: false, delete: false },
  },
  fields: fieldsFromZod(COPY_SCHEMAS[entry.name], entry.overlay),
}));

/* -------------------------------------------------------------------------
   Collections
   ------------------------------------------------------------------------- */

export default defineConfig({
  clientId: clientId ?? null,
  token: token ?? null,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main",

  build: {
    // Gitignored. Its absence is what makes /admin 404 when Tina is not
    // configured — see the note at the top of this file.
    outputFolder: "admin",
    publicFolder: "public",
  },

  media,

  schema: {
    collections: [
      ...copyCollections,
      {
        name: "site",
        label: "Site settings",
        path: "content",
        format: "json",
        match: { include: "site" },
        ui: {
          // One file, not a list. Editors should never be able to create a
          // second site.json or delete the only one.
          allowedActions: { create: false, delete: false },
        },
        fields: fieldsFromZod(siteSchema, siteOverlay),
      },
      {
        name: "sponsors",
        label: "Sponsors",
        path: "content",
        format: "json",
        match: { include: "sponsors" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "sponsors",
            label: "Sponsors",
            list: true,
            ui: {
              itemProps: (item: { name?: string }) => ({
                label: item?.name ?? "New sponsor",
              }),
            },
            fields: fieldsFromZod(sponsorSchema, sponsorOverlay),
          },
        ],
      },
      {
        name: "team",
        label: "Team roster",
        path: "content",
        format: "json",
        match: { include: "team" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "team",
            label: "Members",
            list: true,
            ui: {
              itemProps: (item: { name?: string }) => ({
                label: item?.name ?? "New member",
              }),
            },
            fields: fieldsFromZod(teamMemberSchema, teamOverlay),
          },
        ],
      },
      {
        name: "tiers",
        label: "Sponsorship tiers",
        path: "content",
        format: "json",
        match: { include: "tiers" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "tiers",
            label: "Tiers",
            list: true,
            ui: {
              itemProps: (item: { name?: string }) => ({
                label: item?.name ?? "New tier",
              }),
            },
            fields: fieldsFromZod(tierSchema, tierOverlay),
          },
        ],
      },
      {
        name: "milestones",
        label: "Progress timeline",
        path: "content",
        format: "json",
        match: { include: "milestones" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "milestones",
            label: "Milestones",
            list: true,
            ui: {
              itemProps: (item: { title?: string }) => ({
                label: item?.title ?? "New milestone",
              }),
            },
            fields: fieldsFromZod(milestoneSchema, milestoneOverlay),
          },
        ],
      },
      {
        name: "roles",
        label: "Open roles",
        path: "content",
        format: "json",
        match: { include: "roles" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "roles",
            label: "Roles",
            list: true,
            ui: {
              itemProps: (item: { title?: string }) => ({
                label: item?.title ?? "New role",
              }),
            },
            fields: fieldsFromZod(roleSchema, roleOverlay),
          },
        ],
      },
      {
        name: "cars",
        label: "The car",
        path: "content/cars",
        format: "json",
        fields: fieldsFromZod(carSchema, carOverlay),
      },
      {
        name: "news",
        label: "News",
        path: "content/news",
        format: "mdx",
        fields: [
          ...fieldsFromZod(newsFrontmatterSchema, newsOverlay),
          {
            type: "rich-text",
            name: "body",
            label: "Post",
            isBody: true,
          },
        ],
        ui: {
          // Slug drives the URL, so it is derived from the headline rather
          // than typed — a stray capital or space in a filename is a broken
          // link nobody notices for a week.
          filename: {
            slugify: (values: { title?: string }) =>
              (values?.title ?? "untitled")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
                .slice(0, 60),
          },
        },
      },
      {
        name: "newsletter",
        label: "Newsletter issues",
        path: "content/newsletter",
        format: "mdx",
        fields: [
          ...fieldsFromZod(newsletterFrontmatterSchema, newsletterOverlay),
          {
            type: "rich-text",
            name: "body",
            label: "Issue",
            isBody: true,
            description:
              'One "Heading 2" per contributing subteam, spelled exactly as the ' +
              "roster spells it, with that subteam's report underneath. Leave a " +
              "subteam out entirely if it did not contribute this month. Use " +
              '"Heading 3" for subheadings inside a section.',
          },
        ],
        ui: {
          // The filename IS the month, and the build refuses an issue whose
          // filename and frontmatter disagree — so it is derived from the two
          // fields that decide it rather than typed.
          filename: {
            slugify: (values: { year?: number; month?: number }) =>
              `${values?.year ?? "0000"}-${String(values?.month ?? 1).padStart(2, "0")}`,
          },
        },
      },
    ],
  },
});
