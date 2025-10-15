require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { recommendForUser } = require('./recommender');
const { buildRAGContext } = require('./retriever');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ---------------------------
// NVIDIA API setup with Mistral model
// ---------------------------
const nvidiaApiKey = "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";

const client = new OpenAI({
    apiKey: nvidiaApiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
});

// ---------------------------
// Recommendation endpoint
// ---------------------------
app.get('/recommend/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const recs = recommendForUser(userId);

    const context = buildRAGContext(userId, recs);

    try {
        const completion = await client.chat.completions.create({
            model: "mistralai/mistral-small-24b-instruct",
            messages: [{
                role: "user",
                content: `You are an expert e-commerce recommendation assistant with deep understanding of user behavior and product preferences.

Context:
${context}

Task:
Based on the user's history and preferences, provide personalized explanations for why each recommended product is a good fit. Consider:
- User's past interactions and category preferences
- Product features and value proposition
- How the product complements their interests

Format your response as:
- Product Name: Personalized explanation (1-2 sentences)

Make explanations conversational, specific, and compelling. Focus on why this product matches their interests.`
            }],
            temperature: 0.2,
            top_p: 0.7,
            max_tokens: 1024,
            stream: false, // Set to true if you want streaming
        });

        const explanation = completion.choices[0]?.message?.content || "No explanation available.";

        res.json({
            user_id: userId,
            recommended_products: recs,
            llm_explanation: explanation
        });
    } catch (err) {
        console.error("NVIDIA API Error:", err);
        res.status(500).json({ error: "NVIDIA API call failed" });
    }
});

// ---------------------------
// Start server
// ---------------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
