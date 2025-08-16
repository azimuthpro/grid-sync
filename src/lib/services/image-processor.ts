import type { InsolationImageData } from '@/types'

export class ImageProcessor {
  private static readonly BASE_URL = 'https://cmm.imgw.pl/cmm/wp-content/uploads/production/ecmwf/oze_sun/mapa_png/'
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 1000 // 1 second

  /**
   * Generate image URLs (1-70)
   */
  private static readonly imagesArray: number[] = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 
    27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 
    51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]
  static generateImageUrls(): string[] {
    const urls: string[] = []
    for (const percentage of ImageProcessor.imagesArray) {
      urls.push(`${ImageProcessor.BASE_URL}ECMWF_PPv_sun_${percentage}_percent.png`)
    }
    return urls
  }

  /**
   * Fetch image with retry logic
   */
  static async fetchImage(url: string): Promise<ArrayBuffer> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'GridSync/1.0.0 (Energy Data Fetcher)'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.arrayBuffer()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`Attempt ${attempt}/${this.MAX_RETRIES} failed for ${url}:`, lastError.message)
        
        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt) // Exponential backoff
        }
      }
    }

    throw new Error(`Failed to fetch image after ${this.MAX_RETRIES} attempts: ${lastError?.message}`)
  }

  /**
   * Convert ArrayBuffer to base64 string for Gemini API
   */
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Extract percentage value from image URL
   */
  static extractPercentageFromUrl(url: string): number {
    const match = url.match(/ECMWF_PPv_sun_(\d+)_percent\.png$/)
    if (!match) {
      throw new Error(`Cannot extract percentage from URL: ${url}`)
    }
    return parseInt(match[1], 10)
  }

  /**
   * Process all images and return data structure for Gemini processing
   */
  static async processImages(): Promise<InsolationImageData[]> {
    const urls = this.generateImageUrls()
    const results: InsolationImageData[] = []
    const errors: string[] = []

    console.log(`Starting to process ${urls.length} images...`)

    for (const url of urls) {
      try {
        const percentage = this.extractPercentageFromUrl(url)
        // const arrayBuffer = await this.fetchImage(url)
        
        // Create initial data structure - will be populated by Gemini analysis
        const imageData: InsolationImageData = {
          imageUrl: url,
          percentage,
          date: '', // Will be extracted by Gemini
          hour: 0,  // Will be extracted by Gemini
          cityData: {} // Will be populated by Gemini
        }

        results.push(imageData)
        console.log(`Successfully processed image: ${url}`)
      } catch (error) {
        const errorMessage = `Failed to process ${url}: ${error instanceof Error ? error.message : String(error)}`
        console.error(errorMessage)
        errors.push(errorMessage)
      }
    }

    if (errors.length > 0) {
      console.warn(`Image processing completed with ${errors.length} errors:`, errors)
    }

    console.log(`Successfully processed ${results.length}/${urls.length} images`)
    return results
  }

  /**
   * Fetch single image and convert to base64
   */
  static async fetchImageAsBase64(url: string): Promise<string> {
    const arrayBuffer = await this.fetchImage(url)
    return this.arrayBufferToBase64(arrayBuffer)
  }

  /**
   * Delay utility for retry logic
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Validate image URL format
   */
  static isValidImageUrl(url: string): boolean {
    return /^https:\/\/cmm\.imgw\.pl\/.*\/ECMWF_PPv_sun_\d+_percent\.png$/.test(url)
  }

  /**
   * Get image metadata
   */
  static getImageMetadata(url: string): { percentage: number; filename: string } {
    const percentage = this.extractPercentageFromUrl(url)
    const filename = url.split('/').pop() || ''
    return { percentage, filename }
  }
}