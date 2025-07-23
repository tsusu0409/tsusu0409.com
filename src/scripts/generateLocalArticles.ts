import * as fs from "fs";
import * as path from "path";
const matter = require("gray-matter");

const blogDir = path.join(__dirname, "../pages/blog");
const outPath = path.join(__dirname, "../data/localArticles.json");

const files = fs.readdirSync(blogDir).filter(f => f.endsWith(".md"));

const articles = files.map(filename => {
  const fullPath = path.join(blogDir, filename);
  const fileContent = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    title: data.title || "",
    link: `/blog/${filename.replace(/\.md$/, "")}`,
    thumb: data.thumb || null,
    description: data.description || content.slice(0, 100),
    pubDate: data.date || "",
    source: "tsusu0409.com"
  };
});

fs.writeFileSync(outPath, JSON.stringify(articles, null, 2));
console.log("localArticles.json generated!");