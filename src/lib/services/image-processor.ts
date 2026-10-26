import type { InsolationImageData } from '@/types'

export class ImageProcessor {
  // modele.imgw.pl loads these via fetch() and shows them as blob: URLs; the files themselves are plain PNGs
  private static readonly BASE_URL = 'https://modele.imgw.pl/wp-content/uploads/production/ecmwf/oze_sun/mapa_png/'
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 1000 // 1 second

  // Forecast steps +1h..+72h, the map for step N covers local hour N % 24 (step 1 = 01:00-02:00).
  // Steps covering 21:00-03:00 are 0% across Poland all year round, so they are skipped.
  private static readonly FORECAST_HOURS = 72
  private static readonly NIGHT_STEPS = new Set([21, 22, 23, 0, 1, 2])
  private static readonly IMAGE_PERCENTAGES: number[] = Array.from(
    { length: ImageProcessor.FORECAST_HOURS },
    (_, i) => i + 1
  ).filter((step) => !ImageProcessor.NIGHT_STEPS.has(step % 24))

  private static readonly FETCH_HEADERS: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Referer': 'https://modele.imgw.pl/serwis-oze?tab=forecasts',
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

        // A moved/retired path answers 200 with an HTML page instead of a 404
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.startsWith('image/')) {
          throw new Error(`Expected an image, got ${contentType || 'unknown content type'}`)
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
    return /^https:\/\/modele\.imgw\.pl\/.*\/ECMWF_PPv_sun_\d+_percent\.png$/.test(url)
  }

  static getImageMetadata(url: string): { percentage: number; filename: string } {
    const percentage = this.extractPercentageFromUrl(url)
    const filename = url.split('/').pop() || ''
    return { percentage, filename }
  }
}