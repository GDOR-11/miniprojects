import esbuild from "esbuild";
import fs from "fs/promises";
import path from "path";

const project = process.argv[2];
const prod = process.argv[3] === "true";

if (project === undefined) throw "please specify project";

try {
    await fs.rm(`dist/${project}`, { recursive: true });
} catch (err) { }

const html_pages = (await fs.readdir(`./src/${project}`, { withFileTypes: true, recursive: true })).filter(dirent => dirent.name.endsWith(".html"));

console.log("building...");
let ctx = await esbuild.context({
    entryPoints: [`./src/${project}/index.js`],
    minify: prod,
    bundle: true,
    outdir: `dist/${project}`,
    sourcemap: !prod
});
console.log("build finished!");

await Promise.all(html_pages.map(dirent => fs.cp(path.join(dirent.parentPath, dirent.name), path.join("dist", path.relative("src", path.join(dirent.parentPath, dirent.name))))));

console.log("serving on: " + (await ctx.serve({
    port: 3000,
    servedir: `./dist`
})).hosts.join(", "));
