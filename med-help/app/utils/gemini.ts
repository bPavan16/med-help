import { GoogleGenerativeAI } from '@google/generative-ai';

interface MedicineFormulation {
  form: string;
  strengths: string[];
}

interface MedicineResponse {
  medicine_name: string;
  type: string;
  generic_name: string;
  manufacturer: string;
  formulations: MedicineFormulation[];
  uses: string[];
  dosage: string;
  warnings: string[];
  side_effects: string[];
  storage: string;
  important_note: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delay: number,
  onRetry: (attempt: number, delay: number) => void
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) throw lastError;
      onRetry(attempt, delay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function analyzeMedicine(
  searchText: string,
  notify: (message: string) => void
): Promise<MedicineResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    notify('Analyzing medicine...');

    const result = await retry(
      async () => {
        const prompt = `Analyze the following ${searchText} and provide detailed information with no special charecters or symbols.:
          Name: 
          Type: 
          Generic Name: 
          Manufacturer: 
          Formulations: (list forms and strengths, compulsory)
          Uses: 
          Dosage: 
          Warnings: 
          Side Effects: 
          Storage: 
          Important Note: 

           `;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        if (!text) throw new Error('Empty response from API');
        return text;
      },
      3,
      1000,
      (attempt, delay) => {
        notify(`Retrying analysis in ${delay / 1000} seconds... (Attempt ${attempt}/3)`);
      }
    );

    notify('Processing response...');

    const sections = result.split('\n\n').filter(section => section.trim());

    const parsedResponse: MedicineResponse = {
      medicine_name: 'Unknown Medicine',
      type: 'Unknown Type',
      generic_name: 'Unknown Generic Name',
      manufacturer: 'Unknown Manufacturer',
      formulations: [],
      uses: [],
      dosage: 'No dosage information available',
      warnings: [],
      side_effects: [],
      storage: 'No storage information available',
      important_note: 'No additional information available'
    };

    for (const section of sections) {
      const lowerSection = section.toLowerCase();
      const value = section.split(':')[1]?.trim() || '';

      if (lowerSection.includes('medicine name')) {
        parsedResponse.medicine_name = value;
      } else if (lowerSection.includes('type')) {
        parsedResponse.type = value;
      } else if (lowerSection.includes('generic name')) {
        parsedResponse.generic_name = value;
      } else if (lowerSection.includes('manufacturer')) {
        parsedResponse.manufacturer = value;
      } else if (lowerSection.includes('formulations')) {
        try {
          const forms = value.split('\n').map(form => {
            const [formType, strengths] = form.split('-').map(s => s.trim());
            return {
              form: formType,
              strengths: strengths.split(',').map(s => s.trim())
            };
          });
          parsedResponse.formulations = forms;
        } catch {
          parsedResponse.formulations = [];
        }
      } else if (lowerSection.includes('uses')) {
        parsedResponse.uses = value.split('\n').map(use => use.trim()).filter(Boolean);
      } else if (lowerSection.includes('dosage')) {
        parsedResponse.dosage = value;
      } else if (lowerSection.includes('warnings')) {
        parsedResponse.warnings = value.split('\n').map(warning => warning.trim()).filter(Boolean);
      } else if (lowerSection.includes('side effects')) {
        parsedResponse.side_effects = value.split('\n').map(effect => effect.trim()).filter(Boolean);
      } else if (lowerSection.includes('storage')) {
        parsedResponse.storage = value;
      } else if (lowerSection.includes('important note')) {
        parsedResponse.important_note = value;
      }
    }

    notify('Analysis complete!');
    return parsedResponse;

  } catch (error) {
    console.error('Error analyzing medicine:', error);
    throw new Error('Failed to analyze medicine. Please try again.');
  }
}