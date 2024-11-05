import Airtable from 'airtable';
import type { Company } from '../types';

export class AirtableService {
  private base: Airtable.Base;

  constructor(apiKey: string, baseId: string) {
    Airtable.configure({ apiKey });
    this.base = Airtable.base(baseId);
  }

  async fetchCompanies(): Promise<Company[]> {
    try {
      const records = await this.base('Companies').select({
        view: 'Grid view'
      }).all();

      return records.map(record => ({
        id: record.id,
        name: record.get('Company Name') as string,
        careerPageUrl: record.get('Career Page URL') as string
      }));
    } catch (error) {
      console.error('Error fetching companies from Airtable:', error);
      throw new Error('Failed to fetch companies from Airtable');
    }
  }
}