import type { InsolationImageData } from '@/types'

export class ImageProcessor {
  private static readonly BASE_URL = 'https://cmm.imgw.pl/cmm/wp-content/uploads/production/ecmwf/oze_sun/mapa_png/'
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 1000 // 1 second

  private static readonly IMAGE_PERCENTAGES: number[] = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46,
    51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]

  private static readonly FETCH_HEADERS: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Referer': 'https://modele.imgw.pl/cmm/?page_id=37629',
    'Origin': 'https://modele.imgw.pl',
    'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
  }

  static generateImageUrls(): string[] {
    return this.IMAGE_PERCENTAGES.map(
      (percentage) => `${this.BASE_URL}ECMWF_PPv_sun_${percentage}_percent.png`
    )
  }

  static async fetchImage(url: string): Promise<ArrayBuffer> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, { headers: this.FETCH_HEADERS })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.arrayBuffer()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`Attempt ${attempt}/${this.MAX_RETRIES} failed for ${url}:`, lastError.message)

        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt)
        }
      }
    }

    throw new Error(`Failed to fetch image after ${this.MAX_RETRIES} attempts: ${lastError?.message}`)
  }

  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString('base64')
  }

  static extractPercentageFromUrl(url: string): number {
    const match = url.match(/ECMWF_PPv_sun_(\d+)_percent\.png$/)
    if (!match) {
      throw new Error(`Cannot extract percentage from URL: ${url}`)
    }
    return parseInt(match[1], 10)
  }

  static async processImages(): Promise<InsolationImageData[]> {
    const urls = this.generateImageUrls()
    console.log(`Starting to process ${urls.length} images...`)

    const results = urls.map((url): InsolationImageData => ({
      imageUrl: url,
      percentage: this.extractPercentageFromUrl(url),
      date: '',
      hour: 0,
      cityData: {},
    }))

    console.log(`Successfully processed ${results.length}/${urls.length} images`)
    return results
  }

  static async fetchImageAsBase64(url: string): Promise<string> {
    const arrayBuffer = await this.fetchImage(url)
    return this.arrayBufferToBase64(arrayBuffer)
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static isValidImageUrl(url: string): boolean {
    return /^https:\/\/cmm\.imgw\.pl\/.*\/ECMWF_PPv_sun_\d+_percent\.png$/.test(url)
  }

  static getImageMetadata(url: string): { percentage: number; filename: string } {
    const percentage = this.extractPercentageFromUrl(url)
    const filename = url.split('/').pop() || ''
    return { percentage, filename }
  }
}