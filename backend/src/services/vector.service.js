// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
let pc, cohortChatGptIndex;
let pineconeEnabled = false;

try {
    if (process.env.PINECONE_API_KEY) {
        pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        cohortChatGptIndex = pc.Index('cohort-chat-gpt');
        pineconeEnabled = true;
        console.log("Pinecone initialized successfully");
    } else {
        console.warn("PINECONE_API_KEY not found, vector search disabled");
    }
} catch (error) {
    console.error("Failed to initialize Pinecone:", error.message);
    console.warn("Vector search will be disabled");
}

async function createMemory({vector,metadata,messageId}){
    if (!pineconeEnabled) {
        console.log("Pinecone disabled, skipping memory creation");
        return;
    }
    
    try {
        await cohortChatGptIndex.upsert([{
             id: messageId, 
        values: vector,   // ✅ Correct key
        metadata
        }])
        console.log("Memory created=>",metadata)
    } catch (error) {
        console.error("Error creating memory:", error.message);
    }
}
async function queryMemory({ queryVector, limit = 5, metadata }) {
  if (!pineconeEnabled) {
    console.log("Pinecone disabled, returning empty memory");
    return [];
  }
  
  try {
    const data = await cohortChatGptIndex.query({
      vector: queryVector,
      topK: limit,
      filter: (metadata && Object.keys(metadata).length > 0) ? metadata : undefined,
      includeMetadata: true
    });
    return data.matches || [];
  } catch (error) {
    console.error("Error querying memory:", error.message);
    return [];
  }
}

async function deleteUserFromPinecone(userId) {
  if (!pineconeEnabled) {
    console.log("Pinecone disabled, skipping user data deletion");
    return;
  }
  
  try {
    await cohortChatGptIndex.deleteAll({ namespace: userId.toString() });
    console.log(`✅ Deleted Pinecone data for user: ${userId}`);
  } catch (err) {
    console.error("❌ Error deleting Pinecone data:", err);
  }
}

async function deleteUserData(userId, chatId) {
  if (!pineconeEnabled) {
    console.log("Pinecone disabled, skipping chat data deletion");
    return;
  }
  
  try {
    // Delete specific chat data from Pinecone
    await cohortChatGptIndex.deleteMany({
      filter: {
        userId: userId,
        chatId: chatId
      }
    });
    console.log(`✅ Deleted Pinecone data for user: ${userId}, chat: ${chatId}`);
  } catch (err) {
    console.error("❌ Error deleting Pinecone chat data:", err);
    throw err;
  }
}

module.exports = {
    createMemory,
    queryMemory,
    deleteUserFromPinecone,
    deleteUserData
}