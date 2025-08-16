import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import type { GeminiVisionResponse, PolishCity } from '@/types'
import { POLISH_CITIES_WITH_PROVINCES, getProvinceForCity } from '@/types'
import { ImageProcessor } from './image-processor'

// Zod schema for structured output from Gemini
const InsolationDataSchema = z.object({
  date: z.string().describe('Date extracted from the image in YYYY-MM-DD format'),
  hour: z.number().min(0).max(23).describe('Hour extracted from the image (0-23)'),
  cities: z.array(z.object({
    name: z.string().describe('Polish city name as it appears on the map'),
    province: z.string().optional().describe('Polish province/voivodeship where the city is located (if identifiable)'),
    insolation_percentage: z.number().min(0).max(100).describe('Solar insolation percentage for this city')
  })).describe('List of Polish cities with their insolation percentages')
})

export class GeminiVisionService {
  private static readonly model = google('gemini-2.5-flash')
  
  /**
   * Analyze image using Gemini 2.5 Flash and extract structured data
   */
  static async analyzeImage(imageUrl: string): Promise<GeminiVisionResponse> {
    try {
      // Fetch image as base64
      const base64Image = await ImageProcessor.fetchImageAsBase64(imageUrl)
      
      // Create prompt for extracting data from PV insolation map
      const prompt = this.createAnalysisPrompt()
      
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
                text: prompt
              },
              {
                type: 'image',
                image: `data:image/png;base64,${base64Image}`
              }
            ]
          }
        ],
        temperature: 0.1 // Low temperature for consistent extraction
      })

      // Validate and normalize city names
      const normalizedCities = this.normalizeCityData(object.cities)

      return {
        date: object.date,
        hour: object.hour,
        cities: normalizedCities
      }
    } catch (error) {
      console.error(`Failed to analyze image ${imageUrl}:`, error)
      throw new Error(`Gemini analysis failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Create analysis prompt for Gemini
   */
  private static createAnalysisPrompt(): string {
    const cityList = Object.keys(POLISH_CITIES_WITH_PROVINCES).join(', ')
    
    return `You are analyzing a Polish meteorological map showing photovoltaic (PV) solar energy generation capacity as percentages.

    The image shows:
    1. A map of Poland with cities marked
    2. Date and time information (extract the current forecast date and hour)
    3. Color-coded areas showing solar insolation percentages
    4. City labels with PV insolation percentage
    5. Legend or scale showing percentage values

    Your task:
    1. Extract the DATE from the image (format: YYYY-MM-DD)
    2. Extract the HOUR from the image (0-23 format)
    3. For each of these Polish cities that you can identify on the map, extract the solar insolation percentage and province if visible:

    Cities to look for: ${cityList}

    Polish Provinces (Voivodeships): Dolnośląskie, Kujawsko-Pomorskie, Lubelskie, Lubuskie, Łódzkie, Małopolskie, Mazowieckie, Opolskie, Podkarpackie, Podlaskie, Pomorskie, Śląskie, Świętokrzyskie, Warmińsko-Mazurskie, Wielkopolskie, Zachodniopomorskie

    Actual year is ${new Date().getFullYear()}. Actual month is ${new Date().getMonth() + 1}. Actual day is ${new Date().getDate()}.

    IMPORTANT INSTRUCTIONS:   
    - Only include cities that you can clearly identify on the map
    - DO NOT include cities with 0% insolation values
    - The percentage values represent solar insolation capacity (0-100%)
    - If a city is not visible or you cannot determine its value, do not include it
    - If you can identify the province/voivodeship for a city, include it
    - Use exact city names as provided in the list above
    - Be precise with percentage values based on the color coding/legend
    - Date should be in YYYY-MM-DD format
    - Hour should be a number from 0-23
    - Skip any city showing 0% insolation percentage

    The map shows forecast data for photovoltaic energy generation potential across Poland.`
  }

  /**
   * Normalize and validate city data against known Polish cities
   */
  private static normalizeCityData(cities: Array<{ name: string; province?: string; insolation_percentage: number }>): Array<{ name: string; province?: string; insolation_percentage: number }> {
    const normalized: Array<{ name: string; province?: string; insolation_percentage: number }> = []
    
    for (const city of cities) {
      // Skip cities with 0% insolation
      if (city.insolation_percentage === 0) {
        console.log(`Skipping ${city.name} with 0% insolation`)
        continue
      }

      // Find matching city name (case-insensitive, handling diacritics)
      const matchedCity = this.findMatchingCity(city.name)
      
      if (matchedCity) {
        // Validate percentage range
        const percentage = Math.min(Math.max(city.insolation_percentage, 0), 100)
        
        // Use the province from Gemini if provided, otherwise get it from our mapping
        const finalProvince = city.province || getProvinceForCity(matchedCity)
        
        normalized.push({
          name: matchedCity,
          province: finalProvince,
          insolation_percentage: percentage
        })
      } else {
        console.warn(`City not found in Polish cities list: ${city.name}`)
      }
    }

    return normalized
  }

  /**
   * Find matching city name from the POLISH_CITIES list
   */
  private static findMatchingCity(cityName: string): PolishCity | null {
    const normalized = cityName.trim()
    
    const polishCities = Object.keys(POLISH_CITIES_WITH_PROVINCES)
    
    // Exact match first
    const exactMatch = polishCities.find(city => city === normalized)
    if (exactMatch) return exactMatch as PolishCity

    // Case-insensitive match
    const caseInsensitiveMatch = polishCities.find(
      city => city.toLowerCase() === normalized.toLowerCase()
    )
    if (caseInsensitiveMatch) return caseInsensitiveMatch as PolishCity

    // Partial match (for cases where city might have additional text)
    const partialMatch = polishCities.find(city => 
      city.toLowerCase().includes(normalized.toLowerCase()) ||
      normalized.toLowerCase().includes(city.toLowerCase())
    )
    if (partialMatch) return partialMatch as PolishCity

    // Handle common variations
    const variations: Record<string, PolishCity> = {
      'warszawa': 'Warszawa',
      'krakow': 'Kraków',
      'cracow': 'Kraków',
      'wroclaw': 'Wrocław',
      'poznan': 'Poznań',
      'gdansk': 'Gdańsk',
      'lodz': 'Łódź',
      'jawor': 'Jawor',
      'czestochowa': 'Częstochowa'
    }

    const variationMatch = variations[normalized.toLowerCase()]
    if (variationMatch) return variationMatch

    return null
  }

  /**
   * Batch analyze multiple images
   */
  static async analyzeImages(imageUrls: string[]): Promise<GeminiVisionResponse[]> {
    const results: GeminiVisionResponse[] = []
    const errors: string[] = []

    console.log(`Starting Gemini analysis for ${imageUrls.length} images...`)

    for (const [index, url] of imageUrls.entries()) {
      try {
        console.log(`Analyzing image ${index + 1}/${imageUrls.length}: ${url}`)
        const result = await this.analyzeImage(url)
        results.push(result)
        
        // Small delay to avoid rate limiting
        if (index < imageUrls.length - 1) {
          await this.delay(500) // 500ms delay between requests
        }
      } catch (error) {
        const errorMessage = `Failed to analyze image ${url}: ${error instanceof Error ? error.message : String(error)}`
        console.error(errorMessage)
        errors.push(errorMessage)
      }
    }

    if (errors.length > 0) {
      console.warn(`Gemini analysis completed with ${errors.length} errors:`, errors)
    }

    console.log(`Successfully analyzed ${results.length}/${imageUrls.length} images`)
    return results
  }

  /**
   * Delay utility for rate limiting
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Test single image analysis (for debugging)
   */
  static async testImageAnalysis(imageUrl: string): Promise<GeminiVisionResponse> {
    console.log(`Testing image analysis for: ${imageUrl}`)
    const result = await this.analyzeImage(imageUrl)
    console.log('Analysis result:', JSON.stringify(result, null, 2))
    return result
  }
}