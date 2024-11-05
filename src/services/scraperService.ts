import puppeteer, { Browser, Page } from 'puppeteer';
import type { JobPosting } from '../types';

export class ScraperService {
  private browser: Browser | null = null;

  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async scrapeJobPostings(url: string): Promise<JobPosting[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      // Common selectors for job listings across different platforms
      const selectors = [
        '.jobs-list .job-card',
        '.careers-list .position',
        '.job-listings .job-item',
        '[data-test="job-listing"]',
        '.job-search-results .job'
      ];

      let jobElements = null;
      for (const selector of selectors) {
        jobElements = await page.$$(selector);
        if (jobElements.length > 0) break;
      }

      if (!jobElements || jobElements.length === 0) {
        throw new Error('No job listings found');
      }

      const jobPostings = await Promise.all(
        jobElements.map(async (element) => {
          const titleSelectors = ['.title', '.position-title', 'h2', '[data-test="job-title"]'];
          const urlSelectors = ['a', '[data-test="job-link"]', '.job-link'];

          const title = await element.evaluate((el, selectors) => {
            for (const selector of selectors) {
              const element = el.querySelector(selector);
              if (element) return element.textContent?.trim();
            }
            return '';
          }, titleSelectors);

          const applicationUrl = await element.evaluate((el, selectors) => {
            for (const selector of selectors) {
              const element = el.querySelector(selector);
              if (element) return element.getAttribute('href');
            }
            return '';
          }, urlSelectors);

          return {
            id: Math.random().toString(36).substr(2, 9),
            title: title || 'Unknown Position',
            company: '', // Will be filled from company data
            applicationUrl: new URL(applicationUrl || '', url).href
          };
        })
      );

      return jobPostings.filter(job => job.applicationUrl && job.title);
    } catch (error) {
      console.error('Error scraping job postings:', error);
      throw new Error('Failed to scrape job postings');
    } finally {
      await page.close();
    }
  }

  async submitApplication(
    url: string,
    formData: Record<string, string>,
    cvPath: string
  ): Promise<boolean> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Common form field patterns
      const fieldPatterns = {
        name: ['name', 'full[_-]?name', 'candidate[_-]?name'],
        email: ['email', 'e[_-]?mail', 'candidate[_-]?email'],
        phone: ['phone', 'telephone', 'mobile', 'contact[_-]?number'],
        resume: ['resume', 'cv', 'file', 'upload']
      };

      // Handle form fields
      for (const [field, value] of Object.entries(formData)) {
        const fieldType = await page.evaluate((field) => {
          const input = document.querySelector(`input[name="${field}"], textarea[name="${field}"]`);
          return input?.getAttribute('type') || input?.tagName.toLowerCase();
        }, field);

        if (fieldType === 'file') {
          const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            page.click(`input[name="${field}"]`)
          ]);
          await fileChooser.accept([cvPath]);
        } else {
          await page.type(`[name="${field}"]`, value);
        }
      }

      // Handle CAPTCHA
      const captchaFrame = await page.$('iframe[src*="recaptcha"]');
      if (captchaFrame) {
        // Implement reCAPTCHA solving service integration here
        throw new Error('CAPTCHA detected - manual intervention required');
      }

      // Submit form
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      if (!submitButton) {
        throw new Error('Submit button not found');
      }

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        submitButton.click()
      ]);

      // Verify submission
      const successIndicators = [
        '.success-message',
        '.application-confirmed',
        '[data-test="success"]',
        '.thank-you'
      ];

      const isSuccess = await page.evaluate((selectors) => {
        return selectors.some(selector => document.querySelector(selector) !== null);
      }, successIndicators);

      if (!isSuccess) {
        throw new Error('Could not verify successful submission');
      }

      return true;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async extractApplicationForm(url: string): Promise<Record<string, string>> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });

      const formFields = await page.evaluate(() => {
        const fields: Record<string, string> = {};
        const form = document.querySelector('form');
        
        if (!form) throw new Error('No form found on page');

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach((input: HTMLElement) => {
          const name = input.getAttribute('name');
          const type = input.getAttribute('type') || input.tagName.toLowerCase();
          const required = input.hasAttribute('required');
          const label = input.getAttribute('aria-label') || 
                       input.getAttribute('placeholder') ||
                       document.querySelector(`label[for="${input.id}"]`)?.textContent?.trim();

          if (name && !['submit', 'button', 'hidden'].includes(type)) {
            fields[name] = JSON.stringify({
              type,
              required,
              label: label || name
            });
          }
        });

        return fields;
      });

      return formFields;
    } catch (error) {
      console.error('Error extracting form:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}