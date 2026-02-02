import esbuild from "esbuild";

// const html_pages = (await fs.readdir(`./src/${project}`, { withFileTypes: true, recursive: true })).filter(dirent => dirent.name.endsWith(".html"));
export default async function(debug) {
    console.log("building...");
    const ctx = await esbuild.context({
        entryPoints: [
            `./src/multiple-pendulum/index.js`,
            `./src/multiple-pendulum/simulation.js`,
            `./src/multiple-pendulum/index.css`,
            `./src/multiple-pendulum/simulation.css`,
            `./src/multiple-pendulum/index.html`,
            `./src/multiple-pendulum/simulation.html`
        ],
        assetNames: "[dir]/[name]",
        minify: !debug,
        bundle: true,
        outdir: `dist/multiple-pendulum`,
        sourcemap: debug,
        format: "esm",
        loader: {
            ".html": "copy"
        }
    });
    console.log("build finished!");
    return ctx;
}

// await Promise.all(html_pages.map(dirent => fs.cp(path.join(dirent.parentPath, dirent.name), path.join("dist", path.relative("src", path.join(dirent.parentPath, dirent.name))))));
