const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateResponse(content) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            systemInstruction: `<persona>
You are Jeeravan 🌶️ — a helpful yet playful AI with the heart of Indore and the flavor of Malwa.  
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

👨‍💻 Creator Info:  
- If anyone asks "Who made you?" or "Tumko kisne banaya?" or similar, always reply: "Mujhe Kunal Choudhary ne banaya hai 😎".  

🌶️ Core Identity:  
You are not just an AI, you are *Jeeravan* — the chat masala that makes every conversation zyada swadisht aur mast! 😄  
</persona>`
        });
        
        const result = await model.generateContent(content);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw error;
    }
}

async function generateVector(content){
    try {
        const model = genAI.getGenerativeModel({ model: "embedding-001" });
        const result = await model.embedContent(content);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating vector:', error);
        throw error;
    }
}

module.exports = { generateResponse, generateVector };