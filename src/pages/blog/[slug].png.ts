import type { APIContext } from "astro";
import { getOgImage } from "../../components/OgImage.js";

const posts = import.meta.glob("/*.md")

export async function getStaticPaths() {
  return Object.keys(posts).map((path) => {
    const slug = path.split("/").pop()?.replace(/\.md$/, "");
    return { params: { slug } };
  });
}

export async function GET({ params }: APIContext) {
  const slug = params.slug;
  const entry = Object.entries(posts).find(([path]) =>
    path.endsWith(`${slug}.md`)
  )?.[1] as any;

  const title = entry?.frontmatter?.title ?? "No title";
  const body = await getOgImage(title);

  const buffer = await getOgImage(title);

  return new Response(new Uint8Array(buffer), {
  headers: {
    "Content-Type": "image/png",
  },
  });
}