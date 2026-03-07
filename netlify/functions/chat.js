exports.handler = async function (event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { userMsg, knowledge, rules } = JSON.parse(event.body);

        const apiKey = process.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "API Key not configured on the server." })
            };
        }

        const systemPrompt = `You are the Fremantle Rebels Softball Club Technical Assistant. Your knowledge base is here:\n${knowledge}\n\nYou MUST follow these rules exactly when answering:\n${rules}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    parts: [{ text: userMsg || "" }]
                }],
                generationConfig: {
                    temperature: 0.2
                }
            })
        });

        const data = await response.json();

        // Check for API errors
        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Failed to communicate with AI service." })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (err) {
        console.error("Serverless Function Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    }
};
