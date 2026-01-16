import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { GeminiVisionResponse, PolishCity } from '@/types';
import { POLISH_CITIES_WITH_PROVINCES, getProvinceForCity } from '@/types';
import { ImageProcessor } from './image-processor';

// Zod schema for structured output from Gemini
const InsolationDataSchema = z.object({
  date: z
    .string()
    .describe('Date extracted from the image in YYYY-MM-DD format'),
  hour: z
    .number()
    .min(0)
    .max(23)
    .describe('Hour extracted from the image (0-23)'),
  cities: z
    .array(
      z.object({
        name: z.string().describe('Polish city name'),
        province: z
          .string()
          .optional()
          .describe(
            'Polish province/voivodeship where the city is located (if identifiable)'
          ),
        insolation_percentage: z
          .number()
          .min(0)
          .max(100)
          .describe('Solar insolation percentage for this city'),
      })
    )
    .describe('List of Polish cities with their insolation percentages'),
});

export class GeminiVisionService {
  private static readonly model = google('gemini-3-flash-preview');

  // Batch processing configuration
  private static readonly BATCH_SIZE = 10; // Process 10 images concurrently
  private static readonly BATCH_DELAY = 1000; // 1 second delay between batches
  private static readonly REQUEST_TIMEOUT = 30000; // 30 second timeout per request

  /**
   * Analyze image using Gemini 2.5 Flash and extract structured data
   */
  static async analyzeImage(imageUrl: string): Promise<GeminiVisionResponse> {
    try {
      // Fetch image as base64
      const base64Image = await ImageProcessor.fetchImageAsBase64(imageUrl);

      // Create prompt for extracting data from PV insolation map
      const prompt = this.createAnalysisPrompt();

      // Generate structured output using Vercel AI SDK
      const { object } = await generateObject({
        model: this.model,
        schema: InsolationDataSchema,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image',
                image: `data:image/png;base64,${base64Image}`,
              },
            ],
          },
        ],
        temperature: 0.1, // Low temperature for consistent extraction
      });

      // Validate and normalize city names
      const normalizedCities = this.normalizeCityData(object.cities);

      return {
        date: object.date,
        hour: object.hour,
        cities: normalizedCities,
      };
    } catch (error) {
      console.error(`Failed to analyze image ${imageUrl}:`, error);
      throw new Error(
        `Gemini analysis failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create analysis prompt for Gemini
   */
  private static createAnalysisPrompt(): string {
    const cityList = Object.keys(POLISH_CITIES_WITH_PROVINCES).join(', ');
    const currentDate = new Date();
    const polishDaysOfWeek = [
      'niedziela',
      'poniedziałek',
      'wtorek',
      'środa',
      'czwartek',
      'piątek',
      'sobota',
    ];

    return `You are analyzing a Polish meteorological map showing photovoltaic (PV) solar energy generation capacity as percentages.

    IMPORTANT TEMPORAL CONTEXT:
    - The images show ACTUAL dates (today or past dates when the forecast was made)
    - However, the measurements/forecasts are for TODAY and FUTURE days
    - Current actual date: ${currentDate.toISOString().split('T')[0]} (${polishDaysOfWeek[currentDate.getDay()]})
    - Polish days of week: ${polishDaysOfWeek.join(', ')}

    The image shows:
    1. A map of Poland with cities marked
    2. Date and time information (extract the current forecast date and hour)
    3. Color-coded areas showing solar insolation percentages
    4. City labels with PV insolation percentage
    5. Legend or scale showing percentage values

    Your task:
    1. First, extract the DATE from the image and identify its corresponding Polish weekday name
    2. Then, look for the weekday name displayed on the image to identify the actual measurement date
    3. Extract the HOUR from the image (0-23 format)
    4. For each of these Polish cities that you can identify on the map, extract the solar insolation percentage and province if visible:

    Cities to look for: ${cityList}

    Polish Provinces (Voivodeships): Dolnośląskie, Kujawsko-Pomorskie, Lubelskie, Lubuskie, Łódzkie, Małopolskie, Mazowieckie, Opolskie, Podkarpackie, Podlaskie, Pomorskie, Śląskie, Świętokrzyskie, Warmińsko-Mazurskie, Wielkopolskie, Zachodniopomorskie

    Polish days of week: ${polishDaysOfWeek.join(', ')}

    Current reference: Year ${currentDate.getFullYear()}, Month ${currentDate.getMonth() + 1}, Day ${currentDate.getDate()}.

    WEEKDAY IDENTIFICATION PROCESS:
    1. Look for "Start: <date>" marking on the image - this indicates TODAY's date (the starting reference point)
    2. Extract any other dates shown on the image (YYYY-MM-DD format)
    3. Calculate which Polish weekday these dates correspond to using the days: ${polishDaysOfWeek.join(', ')}
    4. Look for the actual weekday name displayed on the image (may be different from calculated weekday)
    5. Use the weekday name from the image to determine the actual measurement date
    6. The measurement date might be: TODAY (Start date), TOMORROW (Start + 1 day), or DAY AFTER TOMORROW (Start + 2 days)
    7. Cross-reference with current date: ${currentDate.toISOString().split('T')[0]} (${polishDaysOfWeek[currentDate.getDay()]})
    8. The final date should reflect the measurement period, not necessarily the image creation date

    IMPORTANT INSTRUCTIONS:   
    - Only include cities that you can clearly identify on the map
    - DO NOT include cities with 0% insolation values
    - The percentage values represent solar insolation capacity (0-100), e.g. 10 means that the city has 10% of the potential for solar energy generation
    - Look for "Start: <date>" marking on the image to identify the starting date (today)
    - Remember: image date may be actual past date, but forecast data is for current/future periods
    - The forecast measurement date can only be: today (start date), tomorrow (start + 1), or day after tomorrow (start + 2)
    - Cross-reference the calculated weekday with the weekday name shown on the image
    - If weekday names differ, prioritize the weekday shown on the image for determining measurement date
    - Determine if the displayed weekday corresponds to today, tomorrow, or day after tomorrow relative to the start date
    - If you can identify the province/voivodeship for a city, include it
    - Use exact city names as provided in the list above
    - Date should be in YYYY-MM-DD format
    - Hour should be a number from 0-23
    - Skip any city showing 0% insolation percentage

    The map shows forecast data for photovoltaic energy generation potential across Poland.`;
  }

  /**
   * Normalize and validate city data against known Polish cities
   */
  private static normalizeCityData(
    cities: Array<{
      name: string;
      province?: string;
      insolation_percentage: number;
    }>
  ): Array<{ name: string; province?: string; insolation_percentage: number }> {
    const normalized: Array<{
      name: string;
      province?: string;
      insolation_percentage: number;
    }> = [];

    for (const city of cities) {
      // Skip cities with 0% insolation
      if (city.insolation_percentage === 0) {
        console.log(`Skipping ${city.name} with 0% insolation`);
        continue;
      }

      // Find matching city name (case-insensitive, handling diacritics)
      const matchedCity = this.findMatchingCity(city.name);

      if (matchedCity) {
        // Validate percentage range
        const percentage = Math.min(
          Math.max(city.insolation_percentage, 0),
          100
        );

        // Use the province from Gemini if provided, otherwise get it from our mapping
        const finalProvince = city.province || getProvinceForCity(matchedCity);

        normalized.push({
          name: matchedCity,
          province: finalProvince,
          insolation_percentage: percentage,
        });
      } else {
        console.warn(`City not found in Polish cities list: ${city.name}`);
      }
    }

    return normalized;
  }

  /**
   * Find matching city name from the POLISH_CITIES list
   */
  private static findMatchingCity(cityName: string): PolishCity | null {
    const normalized = cityName.trim();

    const polishCities = Object.keys(POLISH_CITIES_WITH_PROVINCES);

    // Exact match first
    const exactMatch = polishCities.find((city) => city === normalized);
    if (exactMatch) return exactMatch as PolishCity;

    // Case-insensitive match
    const caseInsensitiveMatch = polishCities.find(
      (city) => city.toLowerCase() === normalized.toLowerCase()
    );
    if (caseInsensitiveMatch) return caseInsensitiveMatch as PolishCity;

    // Partial match (for cases where city might have additional text)
    const partialMatch = polishCities.find(
      (city) =>
        city.toLowerCase().includes(normalized.toLowerCase()) ||
        normalized.toLowerCase().includes(city.toLowerCase())
    );
    if (partialMatch) return partialMatch as PolishCity;

    // Handle common variations
    const variations: Record<string, PolishCity> = {
      Gorzów: 'Gorzów Wielkopolski',
      'Zielona G.': 'Zielona Góra',
    };

    const variationMatch = variations[normalized.toLowerCase()];
    if (variationMatch) return variationMatch;

    return null;
  }

  /**
   * Split array into batches for parallel processing
   */
  private static splitIntoBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a single batch of images in parallel
   */
  private static async processBatch(
    imageUrls: string[],
    batchIndex: number,
    totalBatches: number
  ): Promise<{ results: GeminiVisionResponse[]; errors: string[] }> {
    const batchResults: GeminiVisionResponse[] = [];
    const batchErrors: string[] = [];

    console.log(
      `Processing batch ${batchIndex + 1}/${totalBatches} with ${imageUrls.length} images...`
    );
    const batchStartTime = Date.now();

    // Process all images in this batch concurrently
    const promises = imageUrls.map(async (url, index) => {
      try {
        const result = await this.analyzeImage(url);
        console.log(
          `✓ Batch ${batchIndex + 1}, Image ${index + 1}/${imageUrls.length}: ${url}`
        );
        return { success: true, result, error: null };
      } catch (error) {
        const errorMessage = `Failed to analyze image ${url}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(
          `✗ Batch ${batchIndex + 1}, Image ${index + 1}/${imageUrls.length}: ${errorMessage}`
        );
        return { success: false, result: null, error: errorMessage };
      }
    });

    // Wait for all images in batch to complete
    const results = await Promise.allSettled(promises);

    // Process results
    for (const promiseResult of results) {
      if (promiseResult.status === 'fulfilled') {
        const { success, result, error } = promiseResult.value;
        if (success && result) {
          batchResults.push(result);
        } else if (error) {
          batchErrors.push(error);
        }
      } else {
        batchErrors.push(`Promise rejected: ${promiseResult.reason}`);
      }
    }

    const batchTime = Date.now() - batchStartTime;
    console.log(
      `Batch ${batchIndex + 1}/${totalBatches} completed in ${batchTime}ms: ${batchResults.length} success, ${batchErrors.length} errors`
    );

    return { results: batchResults, errors: batchErrors };
  }

  /**
   * Batch analyze multiple images
   */
  static async analyzeImages(
    imageUrls: string[]
  ): Promise<GeminiVisionResponse[]> {
    const startTime = Date.now();
    const results: GeminiVisionResponse[] = [];
    const errors: string[] = [];

    console.log(
      `Starting parallel Gemini analysis for ${imageUrls.length} images...`
    );
    console.log(
      `Configuration: ${this.BATCH_SIZE} images per batch, ${this.BATCH_DELAY}ms delay between batches`
    );

    // Split images into batches for parallel processing
    const batches = this.splitIntoBatches(imageUrls, this.BATCH_SIZE);
    console.log(
      `Processing ${batches.length} batches of up to ${this.BATCH_SIZE} images each`
    );

    // Process each batch sequentially (but images within batch are parallel)
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      try {
        // Process current batch
        const batchResult = await this.processBatch(
          batch,
          batchIndex,
          batches.length
        );

        // Collect results and errors
        results.push(...batchResult.results);
        errors.push(...batchResult.errors);

        // Calculate and log progress
        const processedImages = (batchIndex + 1) * this.BATCH_SIZE;
        const totalProcessed = Math.min(processedImages, imageUrls.length);
        const progress = ((totalProcessed / imageUrls.length) * 100).toFixed(1);
        const elapsedTime = Date.now() - startTime;
        const estimatedTotal =
          (elapsedTime / totalProcessed) * imageUrls.length;
        const remainingTime = estimatedTotal - elapsedTime;

        console.log(
          `Progress: ${totalProcessed}/${imageUrls.length} (${progress}%) - Elapsed: ${elapsedTime}ms, Estimated remaining: ${remainingTime.toFixed(0)}ms`
        );

        // Add delay between batches (except for the last batch)
        if (batchIndex < batches.length - 1) {
          console.log(`Waiting ${this.BATCH_DELAY}ms before next batch...`);
          await this.delay(this.BATCH_DELAY);
        }
      } catch (error) {
        const errorMessage = `Failed to process batch ${batchIndex + 1}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTimePerImage = results.length > 0 ? totalTime / results.length : 0;

    if (errors.length > 0) {
      console.warn(
        `Gemini analysis completed with ${errors.length} errors:`,
        errors
      );
    }

    console.log(
      `Parallel analysis completed: ${results.length}/${imageUrls.length} images in ${totalTime}ms (avg: ${avgTimePerImage.toFixed(0)}ms per image)`
    );
    return results;
  }

  /**
   * Delay utility for rate limiting
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test single image analysis (for debugging)
   */
  static async testImageAnalysis(
    imageUrl: string
  ): Promise<GeminiVisionResponse> {
    console.log(`Testing image analysis for: ${imageUrl}`);
    const result = await this.analyzeImage(imageUrl);
    console.log('Analysis result:', JSON.stringify(result, null, 2));
    return result;
  }
}
