import Image from "next/image";
import Link from "next/link";

import type { ComponentPropsWithoutRef } from "react";

/**
 * How MDX elements render.
 *
 * Post bodies are written in Markdown by team members, so every element they
 * can produce needs a house style — otherwise a post looks like a text file
 * dropped into the middle of the site. Everything here reaches for the same
 * tokens as the rest of the design system; nothing invents a size or a colour.
 *
 * Headings start at h2: the post title is the page's h1, and a Markdown `#`
 * inside a post would otherwise produce a second one.
 */
export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-12 mb-4 text-h2 text-text" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-12 mb-4 text-h2 text-text" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-10 mb-3 text-h3 text-text" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mt-8 mb-2 text-h4 text-text" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-5 text-lead text-text-muted" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mb-5 flex list-disc flex-col gap-2 pl-6 text-lead text-text-muted"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mb-5 flex list-decimal flex-col gap-2 pl-6 text-lead text-text-muted"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-text" {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => <em className="italic" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-8 border-l-2 border-l-accent bg-surface px-6 py-5 text-lead text-text"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border" />,
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const external = /^https?:\/\//.test(href);
    const className =
      "font-semibold text-accent underline underline-offset-4 hover:text-accent-hover";
    // Internal links go through next/link so they navigate client-side;
    // external ones get the security rel that outbound links need.
    return external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      />
    ) : (
      <Link href={href} className={className} {...props} />
    );
  },
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded-xs bg-surface-raised px-1.5 py-0.5 font-mono text-small text-text"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-border bg-surface p-5 font-mono text-small text-text"
      {...props}
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-border p-3 text-caption font-semibold uppercase tracking-wide text-text-muted"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-border p-3 text-small text-text" {...props} />
  ),
  img: ({ src, alt }: ComponentPropsWithoutRef<"img">) => {
    // Markdown image syntax carries no dimensions, so a nominal 16:9 box is
    // assumed. `h-auto` lets the real aspect take over once the file loads,
    // and reserving the width up front is what keeps CLS at zero.
    if (typeof src !== "string") return null;
    return (
      <Image
        src={src}
        alt={alt ?? ""}
        width={1200}
        height={675}
        sizes="(min-width: 768px) 700px, 100vw"
        className="my-8 h-auto w-full rounded-lg border border-border"
      />
    );
  },
};
