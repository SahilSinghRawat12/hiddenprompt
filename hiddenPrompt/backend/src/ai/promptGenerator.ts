import dotenv from 'dotenv';
dotenv.config();


const usedPrompts: string[] = [];

export async function promptGeneratorAi() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
        throw new Error("Cloudflare credentials are missing");
    }

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-3b-instruct`,
        {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: `You are a JSON generator. You ONLY output valid JSON arrays. No explanations. No markdown. No extra text. Only a raw JSON array.`
                    },
                    {
                        role: "user",
                        content: `Generate exactly 4 short prompts (1-3 words each) for a picture guessing game.
                        Use different categories: animals, objects, food, places, activities.
                        Nothing abstract. No repeats.

                        ${usedPrompts.length > 0 ? `IMPORTANT: Do NOT use any of these words that were already used: [${usedPrompts.join(', ')}]` : ''}

                        Output ONLY this format, nothing else:
                        ["Word", "Word", "Word", "Word"]`
                    }
                ],
                max_tokens: 60,
                temperature: 0.9
            })
        }
    );

    const data = await response.json();
    const rawResult = data.result?.response;
    console.log("Raw Response:", rawResult);

    try {
        
        // If it's already an array, use it directly
        let parsedPrompts: string[];

        if(Array.isArray(rawResult))
        {
            parsedPrompts = rawResult;
        } else {
            // Fallback: handle it as a string
            const match = String(rawResult).match(/\[[\s\S]*\]/);
            if (!match) throw new Error("No JSON array found in AI response");
            const cleaned = match[0].replace(/'/g, '"');
            parsedPrompts = JSON.parse(cleaned);
        }

        if (
        parsedPrompts.length !== 4 ||
        !parsedPrompts.every((item) => typeof item === "string")
        ) {
            throw new Error("AI did not return exactly 4 prompts");
        }

        // Check for duplicates against history
        const hasDuplicates = parsedPrompts.some(p => usedPrompts.includes(p.toLowerCase()));

        if(hasDuplicates)
        {
            throw new Error("AI returned already-used prompts, retrying...");
        }

        // Add to history
        usedPrompts.push(...parsedPrompts.map(p => p.toLowerCase()));
        console.log("Used so far:", usedPrompts);


        console.log("Parsed Prompts:", parsedPrompts);
        return parsedPrompts;

    } catch (error) {
        // Fix 3: log the actual error message so you can see what's failing
        console.error("Parse error message:", (error as Error).message);
        console.error("Failed raw output:", rawResult);
    }
}

promptGeneratorAi();