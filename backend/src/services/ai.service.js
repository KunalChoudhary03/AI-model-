const { GoogleGenerativeAI } = require("@google/generative-ai");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Working model found during testing
const WORKING_MODEL = 'models/gemini-2.5-flash-preview-05-20';

async function generateResponse(messages, userName = null) {
    try {
        // Use the working model we found during testing
        const model = ai.getGenerativeModel({ 
            model: WORKING_MODEL,
            systemInstruction: `You are Jeeravan 🌶️ — a helpful yet playful AI with the heart of Indore and the flavor of Malwa.  
Your tone is friendly, lighthearted, and sprinkled with Indori/Malwi in hinglish style expressions.  

🎉 Greetings Style:  
- Begin conversations with warm, local greetings such as:   
  - "Bhiya Ram!"  
  - "Jai Shree Mahakal!"  
  - "Ram Ram!"  
  - or a playful combo like "Arre bhiya ram, kaise ho?"  

✨ Personality Rules:  
- Always be helpful and clear in your answers.  
- Use playful vibes, Indori tapori-style wit, and a touch of Malwi accent.  
- Keep things simple but engaging, like chatting at Sarafa Bazaar over poha-jalebi.  
- Sprinkle in local cultural flavor where possible (food, places, habits, festivals).  
- Stay respectful and kind — never rude.  
- When you know the user's name, use it naturally in conversation to make it more personal and friendly.
- Address users by their name occasionally, especially when greeting or helping them.
- STRICTLY use only Hindi and English words - DO NOT use words from Bengali, Marathi, Gujarati, Tamil, or any other regional languages.
- Stick to pure Hindi/English mix (Hinglish) only.

👨‍💻 Creator Info:  
- If anyone asks "Who made you?" or "Tumko kisne banaya?" or similar, always reply: "Mujhe Kunal Choudhary ne banaya hai 😎".  

🌶️ Core Identity:  
You are not just an AI, you are *Jeeravan* — the chat masala that makes every conversation zyada swadisht aur mast! 😄`
        });
        
        // Build conversation content
        let content = "";
        
        // Add user name context if available
        if (userName) {
            content += `User's name: ${userName}\n\n`;
        }
        
        // Process messages to add conversation context
        if (Array.isArray(messages)) {
            messages.forEach(msg => {
                if (msg.parts && msg.parts[0] && msg.parts[0].text) {
                    if (msg.role === 'user') {
                        content += `User: ${msg.parts[0].text}\n`;
                    } else if (msg.role === 'model') {
                        content += `Jeeravan: ${msg.parts[0].text}\n`;
                    }
                }
            });
        } else if (typeof messages === 'string') {
            // If just a string is passed, treat it as a user message
            content += `User: ${messages}\n`;
        }
        
        // Generate response using simple generateContent
        const result = await model.generateContent(content);
        const response = await result.response;
        return response.text();
        
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
}

async function generateVector(content){
    try {
        const model = ai.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(content);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating vector:', error);
        throw error;
    }
}

async function listAvailableModels() {
    console.log("📋 Fetching available models from Google AI...");
    
    try {
        // Try to list models using the API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("✅ Available models:");
            data.models.forEach(model => {
                console.log(`  - ${model.name} (${model.displayName})`);
            });
            
            // Return the list of model names
            return data.models.map(model => model.name);
        } else {
            console.log("❌ No models found in response");
            console.log("Full response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log("❌ Error listing models:", error.message);
    }
    
    return [];
}

async function testAIService() {
    try {
        console.log("Testing AI service with NEW API key...");
        console.log("New API Key (first 10 chars):", process.env.GEMINI_API_KEY?.substring(0, 10));
        
        // Test the working model directly
        console.log(`🧪 Testing working model: ${WORKING_MODEL}`);
        const model = ai.getGenerativeModel({ model: WORKING_MODEL });
        const result = await model.generateContent("Test message");
        const response = await result.response;
        console.log(`✅ AI service working with model: ${WORKING_MODEL}`);
        console.log(`Response sample: ${response.text().substring(0, 100)}...`);
        return WORKING_MODEL;
        
    } catch (error) {
        console.error("❌ AI Service test failed:", error.message);
        return false;
    }
}

module.exports = {
    generateResponse,
    generateVector,
    testAIService,
    listAvailableModels
}