import { exec } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import { slug } from "./slug.js";
import fs from "fs";

export const execShell = (cmd, cwd) =>
    new Promise((resolve, reject) => {
        exec(cmd, { cwd }, (err, stdout, stderr) => {
            if (err) return reject(err);
            if (stderr) return reject(new Error(stderr));
            resolve(stdout);
        });
    });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(`${__filename}`);

const randomOf = arr => arr[Math.floor(Math.random() * arr.length)];

const PACKAGE_NAMES = [
    "cdn-file-host",
    "cdn-upload-temp",
    "cdn-free-uploader"
];

const createPackageNpm = async ({ filename, dataFile }) => {
    const cleanFilename = slug(filename);
    const packageName = randomOf(PACKAGE_NAMES);
    const version = `1.0.0-${Date.now()}`;
    const dir = path.join(__dirname, packageName);

    fs.mkdirSync(dir, { recursive: true });

    const pkgJSON = {
        name: packageName,
        version,
        description: "Temporary CDN free upload file",
        main: "index.js",
        keywords: ["cdn", "upload", "free-type"],
        author: "Uploader",
        license: "MIT"
    };

    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkgJSON, null, 2));

    fs.writeFileSync(
        path.join(dir, "index.js"),
        `console.log("Package: ${packageName}")`
    );

    fs.writeFileSync(
        path.join(dir, ".npmrc"),
        `registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}\n`
    );

    fs.writeFileSync(path.join(dir, cleanFilename), dataFile);

    await execShell("npm publish --tag beta --quiet", dir);

    fs.rmSync(dir, { recursive: true, force: true });

    return { packageName, version, filename: cleanFilename};
};

export default createPackageNpm;