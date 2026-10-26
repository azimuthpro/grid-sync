import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
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
  private static readonly model = google('gemini-3.8-flash');

  // Batch processing configuration
  private static readonly BATCH_SIZE = 10; // Process 10 images concurrently
  private static readonly BATCH_DELAY = 1000; // 1 second delay between batches
  private static readonly REQUEST_TIMEOUT = 30000; // 30 second timeout per request

  /**
   * Analyze image using Gemini 3.8 Flash and extract structured data
   */
  static async analyzeImage(imageUrl: string): Promise<GeminiVisionResponse> {
    try {
      const imageBuffer = await ImageProcessor.fetchImage(imageUrl);

      // Create prompt for extracting data from PV insolation map
      const prompt = this.createAnalysisPrompt();

      // Gemini 3+ is tuned for the default temperature; lowering it can cause looping
      const { output: object } = await generateText({
        model: this.model,
        output: Output.object({ schema: InsolationDataSchema }),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'file',
                mediaType: 'image/png',
                data: new Uint8Array(imageBuffer),
              },
            ],
          },
        ],
        timeout: this.REQUEST_TIMEOUT,
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

    return `You are analyzing a Polish meteorological map (IMGW-PIB, modele.imgw.pl) showing the forecast photovoltaic (PV) power output as a percentage of installed capacity.

    Current actual date: ${currentDate.toISOString().split('T')[0]} (${polishDaysOfWeek[currentDate.getDay()]})

    The image layout:
    1. Header box (top right): Polish weekday name, day and month as "DD.MM", and the forecast hour interval, e.g. "Poniedziałek 26.10 | 12:00-13:00"
    2. A map of Poland with city names, each with a percentage label next to it
    3. Legend "Instalacja PV - MOC GENEROWANA (%)" with a 0-100 color scale (bottom left)
    4. Footer: "Model: ECMWF HRES 0.1°   Aktualizacja: DD.MM.YY HH:MM" - the model run date with a two-digit year

    Your task:
    1. DATE: take the day and month from the header ("DD.MM"). The header has no year: take the year from the "Aktualizacja" date in the footer (two-digit year YY means 20YY). If the header month is earlier than the "Aktualizacja" month (forecast crosses New Year), use the following year. Return YYYY-MM-DD.
    2. Check the header weekday (${polishDaysOfWeek.join(', ')}) against the date you built - they must match. The forecast date is the "Aktualizacja" date or up to 3 days after it.
    3. HOUR: the START hour of the header interval (0-23), e.g. "12:00-13:00" -> 12, "00:00-01:00" -> 0.
    4. For each of these Polish cities that you can identify on the map, extract the percentage printed next to its name:

    Cities to look for: ${cityList}

    Polish Provinces (Voivodeships): Dolnośląskie, Kujawsko-Pomorskie, Lubelskie, Lubuskie, Łódzkie, Małopolskie, Mazowieckie, Opolskie, Podkarpackie, Podlaskie, Pomorskie, Śląskie, Świętokrzyskie, Warmińsko-Mazurskie, Wielkopolskie, Zachodniopomorskie

    IMPORTANT INSTRUCTIONS:
    - Read the percentage printed in the label next to each city name, do not estimate it from the map colors
    - Labels can sit above or below the city name; pair each percentage with its nearest city name
    - Abbreviated names on the map: "Gorzów" = Gorzów Wielkopolski, "Zielona G." = Zielona Góra
    - Only include cities that you can clearly identify on the map
    - DO NOT include cities with 0% values
    - Use exact city names as provided in the list above
    - If you can identify the province/voivodeship for a city, include it
    - Date must be in YYYY-MM-DD format, hour a number from 0-23`;
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
      gorzów: 'Gorzów Wielkopolski',
      'zielona g.': 'Zielona Góra',
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
