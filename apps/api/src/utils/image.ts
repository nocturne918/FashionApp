/**
 * Helper to get the best available image URL for a StockX product.
 * StockX images are typically hosted on images.stockx.com.
 * We can try to use the 360 view images if available, or the standard media URL.
 */
export function getStockXImage(url: string | null, width: number = 800): string | null {
  if (!url) return null;

  if (url.includes('/360/')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'images.stockx.com') {
      urlObj.searchParams.set('fit', 'clip');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('auto', 'compress');
      urlObj.searchParams.set('q', '90');
      return urlObj.toString();
    }
  } catch (e) {
    // Invalid URL, return original
  }

  return url;
}
