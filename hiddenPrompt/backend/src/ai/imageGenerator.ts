import dotenv from 'dotenv';
dotenv.config();


const imageStyles = [
    "a pixelated 8-bit version of",
    "an impressionist blurry painting of",
    "a close-up extreme zoom of",
    "a shadow of",
];

export async function generateImage(prompt: string)
{
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
        throw new Error("Cloudflare credentials are missing");
    }

    // Pick a random hard style
    const randomStyle = imageStyles[Math.floor(Math.random() * imageStyles.length)];

    // e.g. "a shadow of Lion, simple background, no text"
    const imagePrompt = `${randomStyle} ${prompt}, simple background, no text`;
    console.log("Image Prompt:", imagePrompt);

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
        {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: imagePrompt,
                steps: 4  // keep low to save neurons
            })
        }
    );

     if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation failed: ${errorText}`);
    }

    // Check if response is JSON (base64) or raw bytes
const contentType = response.headers.get('content-type');

    let imageBuffer: Buffer;

    if (contentType?.includes('application/json')) {
    // Cloudflare returned base64 JSON
    const json = await response.json() as { result: { image: string } };
    imageBuffer = Buffer.from(json.result.image, 'base64');
} else {
    // Raw image bytes
    const arrayBuffer = await response.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);
}

  return imageBuffer;

}

