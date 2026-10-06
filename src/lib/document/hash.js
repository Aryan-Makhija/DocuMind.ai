
 // In this file we creating a SHA-256n has no for the weach file 

import crypto from "crypto";
import fs from "fs/promises";

export async function getFileHash(filePath) {
    const fileBuffer = await fs.readFile(filePath);

    return crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");
}