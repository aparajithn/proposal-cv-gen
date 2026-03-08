import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function tailorProjectDescription(
  originalDescription: string,
  rfpKeywords: string[]
): Promise<string> {
  const prompt = `
Original project description:
"${originalDescription}"

RFP keywords: ${rfpKeywords.join(', ')}

Rewrite the project description to emphasize experience with these keywords.
Keep it truthful, concise (3-4 sentences), and professional.
Do not hallucinate or add information that isn't in the original description.
  `.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.3, // Lower temperature for more consistent, factual output
  });

  return response.choices[0].message.content || originalDescription;
}

export { openai };
