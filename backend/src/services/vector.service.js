// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding
const cohortChatGptIndex = pc.Index('cohort-chat-gpt');

async function createMemory({vector,metadata,messageId}){
    await cohortChatGptIndex.upsert([{
         id: messageId, 
    values: vector,   // ✅ Correct key
    metadata
    }])
    console.log("fsalsjfad=>",metadata)
}
async function queryMemory({ queryVector, limit = 5, metadata }) {
  const data = await cohortChatGptIndex.query({
    vector: queryVector,
    topK: limit,
    filter: (metadata && Object.keys(metadata).length > 0) ? metadata : undefined,
    includeMetadata: true
  });
  return data.matches;
}

async function deleteUserFromPinecone(userId) {
  try {
    await cohortChatGptIndex.deleteAll({ namespace: userId.toString() });
    console.log(`✅ Deleted Pinecone data for user: ${userId}`);
  } catch (err) {
    console.error("❌ Error deleting Pinecone data:", err);
  }
}
module.exports = {
    createMemory,
    queryMemory,
    deleteUserFromPinecone
}