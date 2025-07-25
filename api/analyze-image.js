import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, fileName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Convert base64 to proper format for Groq Vision
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and provide:
1. A brief description (1-2 sentences)
2. 5-8 relevant tags for categorization

Respond in JSON format:
{
  "description": "Brief description here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Focus on:
- Main subjects/objects in the image
- Colors, mood, style
- Scene/setting
- Activities or actions
- Technical aspects (if relevant)

Keep tags concise and useful for searching.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.3,
      max_tokens: 500
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from AI model');
    }

    // Try to parse JSON response
    let result;
    try {
      // Extract JSON from response if it's wrapped in text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: extract information manually
      const lines = responseText.split('\n').filter(line => line.trim());
      result = {
        description: lines.find(line => line.toLowerCase().includes('description'))?.replace(/.*description[:\-\s]*/i, '') || 'AI analysis completed',
        tags: extractTagsFromText(responseText)
      };
    }

    // Ensure we have valid data
    if (!result.tags || !Array.isArray(result.tags)) {
      result.tags = extractTagsFromText(responseText);
    }

    // Clean and validate tags
    result.tags = result.tags
      .filter(tag => tag && typeof tag === 'string')
      .map(tag => tag.toLowerCase().trim().replace(/[^\w\s-]/g, ''))
      .filter(tag => tag.length > 0 && tag.length < 20)
      .slice(0, 8);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Return a fallback response instead of failing completely
    return res.status(200).json({
      description: 'Image uploaded successfully',
      tags: ['uploaded', 'image', 'photo']
    });
  }
}

function extractTagsFromText(text) {
  // Try to extract tags from various formats
  const tagPatterns = [
    /tags?[:\-\s]*\[(.*?)\]/i,
    /tags?[:\-\s]*([^\n\r]{1,100})/i,
    /#(\w+)/g
  ];

  for (const pattern of tagPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.global) {
        return match.map(tag => tag.replace('#', ''));
      } else {
        const tagString = match[1] || match[0];
        return tagString
          .split(/[,\n\r\|;]/)
          .map(tag => tag.replace(/["\[\]]/g, '').trim())
          .filter(tag => tag.length > 0);
      }
    }
  }

  // Fallback: extract meaningful words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && word.length < 15)
    .slice(0, 5);

  return words.length > 0 ? words : ['image', 'photo'];
}