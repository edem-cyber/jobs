import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiConfig {
  apiKey: string;
  model: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private cvContent: string;
  private knowledgeBase: string;

  constructor(config: GeminiConfig, cvContent: string, knowledgeBase: string) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model;
    this.cvContent = cvContent;
    this.knowledgeBase = knowledgeBase;
  }

  async generateResponse(question: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });

      const prompt = `
        Based on the following CV and additional knowledge:

        CV Content:
        ${this.cvContent}

        Additional Knowledge:
        ${this.knowledgeBase}

        Please generate a professional and relevant response for the following job application question:
        ${question}

        The response should be:
        1. Relevant to the question
        2. Based on the provided CV and knowledge
        3. Professional and well-formatted
        4. Honest and accurate
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response from Gemini');
    }
  }
}