import express from 'express';
import { ApplicationService } from '../services/applicationService';
import { AirtableService } from '../services/airtableService';
import { ScraperService } from '../services/scraperService';
import { GeminiService } from '../services/geminiService';

const router = express.Router();

// Initialize services
const airtableService = new AirtableService(
  process.env.AIRTABLE_BASE_URL!,
  process.env.AIRTABLE_API_KEY!
);
const scraperService = new ScraperService();

router.post('/submit-application', async (req, res) => {
  try {
    const { cv, knowledgeBase } = req.body;

    // Initialize Gemini service with the CV and knowledge base
    const geminiService = new GeminiService(
      {
        apiKey: process.env.GEMINI_API_KEY!,
        model: 'gemini-pro'
      },
      cv,
      knowledgeBase
    );

    // Initialize application service
    const applicationService = new ApplicationService(
      airtableService,
      scraperService,
      geminiService
    );

    // Process the application
    await applicationService.processApplication({ cv, knowledgeBase });

    res.json({ success: true, message: 'Application process started' });
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process application'
    });
  }
});

export default router;