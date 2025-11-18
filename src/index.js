import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import createPackageNpm from './utils/createPackageNpm.js';

dotenv.config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Missing file" });
        }

        const { originalname, buffer } = req.file;

        const result = await createPackageNpm({
            filename: originalname,
            dataFile: buffer,
        });

        const cdnUrl = `https://cdn.jsdelivr.net/npm/${result.packageName}@${result.version}/${result.filename}`;

        res.json({
            message: "Uploaded successfully",
            cdnUrl,
            ...result
        });
    } catch (err) {
        res.status(500).json({ error: err.message || "Upload failed "});
    }
});

app.listen(PORT, () => console.log("Server running at http://localhost:3000"));