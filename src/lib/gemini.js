"use client";

/**
 * Gemini AI Integration for ShramSaathi
 * For skill extraction and job estimation
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "demo";

export async function extractWorkerSkills(text) {
  // Mock function for prototyping
  console.log("Gemini processing:", text);
  
  if (GEMINI_API_KEY === "demo") {
    // Demo mode - return mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockSkills = {
      categories: ["Painter", "Construction"],
      experienceYears: Math.floor(Math.random() * 10) + 1,
      tags: ["Wall Painting", "Interior", "Exterior", "Color Mixing"],
      confidence: 0.85
    };
    
    return mockSkills;
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Extract worker skills from this Hindi/English text: "${text}". Return ONLY JSON: {"categories": [], "experienceYears": number, "tags": []}. Example: "Main painter hoon, 5 saal ka experience hai" -> {"categories": ["Painter"], "experienceYears": 5, "tags": ["Wall", "Interior"]}`
            }]
          }]
        })
      }
    );
    
    const data = await response.json();
    
    // Check for API errors first
    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
    }
    
    // Safely access the nested properties
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid response from Gemini API");
    }
    
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Clean the response text (remove markdown code blocks if present)
    const cleanedText = resultText.replace(/```json\s*|\s*```/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini error:", error);
    
    // Return fallback data if parsing fails
    return {
      categories: ["General Worker"],
      experienceYears: 1,
      tags: ["General Labor"],
      confidence: 0.1,
      error: error.message
    };
  }
}

export async function estimateJobPrice(imageUrl, description) {
  // Mock function for prototyping
  console.log("Gemini Vision processing:", { imageUrl, description });
  
  if (GEMINI_API_KEY === "demo") {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const base = description.length * 50 + 500;
    const range = {
      min: Math.round(base * 0.8),
      max: Math.round(base * 1.2),
      confidence: 0.75,
      breakdown: {
        labor: Math.round(base * 0.6),
        material: Math.round(base * 0.3),
        platformFee: Math.round(base * 0.1)
      }
    };
    
    return range;
  }
  
  try {
    // If we have an image URL, use Gemini Vision
    if (imageUrl) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `Estimate job price based on this description: "${description}". Also analyze the attached image of the work area. Return ONLY JSON with this format: {"min": number, "max": number, "confidence": number, "breakdown": {"labor": number, "material": number, "platformFee": number}}. Consider typical Indian market rates for construction/repair work.`
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: await fetch(imageUrl)
                      .then(res => res.arrayBuffer())
                      .then(buffer => {
                        const bytes = new Uint8Array(buffer);
                        let binary = '';
                        for (let i = 0; i < bytes.byteLength; i++) {
                          binary += String.fromCharCode(bytes[i]);
                        }
                        return window.btoa(binary);
                      })
                  }
                }
              ]
            }]
          })
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Gemini Vision API error:", data.error);
        // Fallback to text-only estimation
        return estimateWithTextOnly(description);
      }
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error("Invalid response structure:", data);
        return estimateWithTextOnly(description);
      }
      
      const resultText = data.candidates[0].content.parts[0].text;
      const cleanedText = resultText.replace(/```json\s*|\s*```/g, '').trim();
      
      return JSON.parse(cleanedText);
    } else {
      // Text-only estimation
      return estimateWithTextOnly(description);
    }
  } catch (error) {
    console.error("Gemini Vision error:", error);
    // Return fallback estimation
    return estimateWithTextOnly(description);
  }
}

// Helper function for text-only estimation
async function estimateWithTextOnly(description) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Estimate job price in Indian Rupees based on this description: "${description}". Return ONLY JSON: {"min": number, "max": number, "confidence": number, "breakdown": {"labor": number, "material": number, "platformFee": number}}. Consider typical Indian market rates for construction/repair work. Example: "Paint a 10x12 feet bedroom" -> {"min": 3000, "max": 5000, "confidence": 0.8, "breakdown": {"labor": 2000, "material": 2000, "platformFee": 500}}`
            }]
          }]
        })
      }
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini text estimation error:", data.error);
      return getFallbackEstimate(description);
    }
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error("Invalid response structure:", data);
      return getFallbackEstimate(description);
    }
    
    const resultText = data.candidates[0].content.parts[0].text;
    const cleanedText = resultText.replace(/```json\s*|\s*```/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Text estimation error:", error);
    return getFallbackEstimate(description);
  }
}

// Fallback estimation based on description
function getFallbackEstimate(description) {
  // Simple heuristic-based estimation
  const desc = description.toLowerCase();
  let base = 1000; // Base price
  
  // Adjust based on keywords
  if (desc.includes('paint') || desc.includes('painting')) {
    base = 2000 + (description.length * 10);
    if (desc.includes('wall') || desc.includes('room')) base += 1000;
    if (desc.includes('exterior') || desc.includes('outside')) base += 2000;
  } else if (desc.includes('plumb') || desc.includes('pipe') || desc.includes('leak')) {
    base = 1500 + (description.length * 15);
  } else if (desc.includes('electric') || desc.includes('wire') || desc.includes('fan') || desc.includes('light')) {
    base = 1200 + (description.length * 12);
  } else if (desc.includes('construct') || desc.includes('build') || desc.includes('mason')) {
    base = 5000 + (description.length * 20);
  } else if (desc.includes('clean') || desc.includes('cleaning')) {
    base = 800 + (description.length * 8);
  } else if (desc.includes('repair') || desc.includes('fix')) {
    base = 1200 + (description.length * 10);
  } else if (desc.includes('install') || desc.includes('fitting')) {
    base = 1800 + (description.length * 15);
  }
  
  // Adjust for description length (more details = likely bigger job)
  base += description.length * 5;
  
  const min = Math.round(base * 0.7);
  const max = Math.round(base * 1.3);
  const confidence = Math.min(0.5 + (description.length / 1000), 0.9); // More details = higher confidence
  
  return {
    min,
    max,
    confidence,
    breakdown: {
      labor: Math.round(base * 0.6),
      material: Math.round(base * 0.3),
      platformFee: Math.round(base * 0.1)
    }
  };
}