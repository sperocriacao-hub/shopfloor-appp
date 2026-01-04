const Jimp = require('jimp');

const INPUT_PATH = '/Users/alessandromoura/.gemini/antigravity/brain/3d35011f-1353-424b-b7d2-16280cc77830/uploaded_image_1767548131778.png';
const OUTPUT_PATH = 'public/logo.png';

async function main() {
    try {
        console.log("Jimp export type:", typeof Jimp);
        console.log("Jimp keys:", Object.keys(Jimp));

        // Try to identify the read function
        const readFunc = Jimp.read || (Jimp.default && Jimp.default.read) || (Jimp.Jimp && Jimp.Jimp.read);

        if (!readFunc) {
            throw new Error("Could not find Jimp.read function. Available keys: " + Object.keys(Jimp).join(", "));
        }

        console.log("Reading image from:", INPUT_PATH);
        const image = await readFunc(INPUT_PATH);

        console.log("Image size:", image.bitmap.width, "x", image.bitmap.height);

        // Get background color from top-left pixel
        const bgColorInt = image.getPixelColor(0, 0);
        const bgColor = JimpClass.intToRGBA(bgColorInt);
        console.log("Detected background color:", bgColor);

        // Scan and replace
        const THRESHOLD = 50; // Increased threshold slightly

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // Simple distance
            const dist = Math.abs(r - bgColor.r) + Math.abs(g - bgColor.g) + Math.abs(b - bgColor.b);

            if (dist < THRESHOLD) {
                this.bitmap.data[idx + 3] = 0; // Alpha 0
            }
        });

        console.log("Writing output to", OUTPUT_PATH);
        await image.writeAsync(OUTPUT_PATH);
        console.log("Done.");

    } catch (error) {
        console.error("Error processing image:", error);
        process.exit(1);
    }
}

main();
