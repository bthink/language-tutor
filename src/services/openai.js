const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  async sendMessage(message, topic, context = []) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You speak english.You are a helpful assistant specializing in ${topic}. Keep responses concise and natural.`
        },
        ...context,
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
} 