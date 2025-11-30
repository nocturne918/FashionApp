import { db } from '../db/db';
import { products } from '../db/tables';
import fs from 'fs';
import path from 'path';
import { env } from '../env';

// CONFIGURATION
const COOKIE_STRING = env.STOCKX_COOKIE;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'App-Platform': 'Iron',
  'App-Version': '2025.11.09.03',
  'apollographql-client-name': 'Iron',
  'apollographql-client-version': '2025.11.09.03',
  'x-stockx-device-id': '6c91df2c-ab57-4bdd-837b-171e9c91665d', // Must match cookie
  'selected-country': 'US',
  'Origin': 'https://stockx.com',
  'Referer': 'https://stockx.com/browse/men',
  'Cookie': COOKIE_STRING
};

const URL = "https://stockx.com/api/p/e";

const QUERY = `
query getDiscoveryData($country: String!, $currency: CurrencyCode, $filters: [BrowseFilterInput], $flow: BrowseFlow, $market: String, $query: String, $sort: BrowseSortInput, $page: BrowsePageInput, $enableOpenSearch: Boolean) {
  browse(
    filters: $filters
    flow: $flow
    sort: $sort
    page: $page
    market: $market
    query: $query
    experiments: {ads: {enabled: true}, dynamicFilter: {enabled: true}, dynamicFilterDefinitions: {enabled: true}, multiselect: {enabled: true}, openSearch: {enabled: $enableOpenSearch}}
  ) {
    results {
      edges {
        objectId
        node {
          ... on Product {
            id
            title
            brand
            urlKey
            productCategory
            description
            gender
            browseVerticals
            media {
              imageUrl
              smallImageUrl
              thumbUrl
            }
            traits(filterTypes: [RELEASE_DATE, RETAIL_PRICE]) {
               name
               value
            }
            market(currencyCode: $currency) {
              state(country: $country, market: $market) {
                lowestAsk {
                  amount
                }
              }
            }
          }
        }
      }
      pageInfo {
        limit
        page
        pageCount
        total
      }
    }
  }
}
`;

// Footwear categories that likely have 360 views
const FOOTWEAR_CATEGORIES = new Set([
  "sneakers", "shoes", "boots", "cleats", "slides-and-sandals",
  "loafers", "slippers", "oxfords", "spikes", "flats", "heels",
  "sandals", "clogs", "lifestyle", "performance", "luxury"
]);

function cleanUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url.split('?')[0];
}

function getFrontImageUrl(imageUrl: string, category: string): string | null {
  if (!imageUrl || !FOOTWEAR_CATEGORIES.has(category)) return null;
  const filename = imageUrl.split('/').pop();
  if (!filename) return null;
  let slug = filename.split('?')[0].replace(/\.(jpg|jpeg|png|webp)$/, '');
  slug = slug.replace(/-Product$/, '');
  return `https://images.stockx.com/360/${slug}/Images/${slug}/Lv2/img10.jpg`;
}

// Load Category Tree
const treePath = path.join(__dirname, 'category_tree.json');
const CATEGORY_TREE = JSON.parse(fs.readFileSync(treePath, 'utf-8'));

// Map of slug -> Parent Category Name
const PARENT_CATEGORY_MAP = new Map<string, string>();

function buildCategoryMap(nodes: any[], parentName: string | null = null) {
  for (const node of nodes) {
    const currentVertical = parentName || node.name;

    if (node.slug) {
      PARENT_CATEGORY_MAP.set(node.slug, currentVertical);
    }

    if (node.subCategories) {
      buildCategoryMap(node.subCategories, currentVertical);
    }
  }
}

buildCategoryMap(CATEGORY_TREE);

async function fetchCategory(categoryId: string, pagesToScrape = 1) {
  console.log(`=== Scraping Category: ${categoryId} ===`);

  for (let pageNum = 1; pageNum <= pagesToScrape; pageNum++) {
    const payload = {
      operationName: "getDiscoveryData",
      variables: {
        country: "US",
        currency: "USD",
        enableOpenSearch: false,
        flow: "CATEGORY",
        market: "US",
        page: { index: pageNum, limit: 40 },
        filters: [
          { id: "category", selectedValues: [categoryId] }
        ],
        sort: { id: "most-active" }
      },
      query: QUERY
    };

    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const edges = data.data?.browse?.results?.edges || [];

        console.log(`Page ${pageNum}: Found ${edges.length} items`);

        for (const edge of edges) {
          const node = edge.node;
          if (!node) continue;

          // Better Image Fallback
          const rawImageUrl = node.media?.imageUrl || node.media?.smallImageUrl || node.media?.thumbUrl;
          const cleanImage = cleanUrl(rawImageUrl);
          const frontImage = cleanImage ? getFrontImageUrl(cleanImage, categoryId) : null;

          // Extract Description & Metadata
          const description = node.description || "";
          const gender = node.gender || "unisex";

          // Extract Traits (Release Date, Retail Price)
          let releaseDate = null;
          let retailPrice = null;
          if (node.traits) {
            const rd = node.traits.find((t: any) => t.name === "Release Date");
            if (rd) releaseDate = rd.value;

            const rp = node.traits.find((t: any) => t.name === "Retail Price");
            if (rp) retailPrice = rp.value;
          }

          const product = {
            stockxId: node.id,
            title: node.title,
            brand: node.brand,
            category: categoryId,
            imageUrl: cleanImage,
            frontImageUrl: frontImage,
            urlKey: node.urlKey,
            lowestAsk: node.market?.state?.lowestAsk?.amount || null,
            description: description,
            parentCategory: PARENT_CATEGORY_MAP.get(categoryId) || 'Other',
            gender: gender,
            releaseDate: releaseDate,
            retailPrice: retailPrice
          };

          if (product.imageUrl) {
            console.log(`FOUND: ${product.brand} - ${product.title}`);

            await db.insert(products).values(product)
              .onConflictDoUpdate({
                target: products.stockxId,
                set: {
                  title: product.title,
                  brand: product.brand,
                  category: product.category,
                  parentCategory: product.parentCategory,
                  imageUrl: product.imageUrl,
                  frontImageUrl: product.frontImageUrl,
                  urlKey: product.urlKey,
                  lowestAsk: product.lowestAsk,
                  description: product.description,
                  updatedAt: new Date()
                }
              });
          }
        }
      } else {
        console.error(`Error ${response.status}: ${response.statusText}`);
        // If 403, cookies expired
        if (response.status === 403) process.exit(1);
        break;
      }
    } catch (e) {
      console.error(`Exception: ${e}`);
    }

    // Sleep to act human
    const sleepTime = Math.random() * 3000 + 2000;
    await new Promise(resolve => setTimeout(resolve, sleepTime));
  }
}

async function main() {
  const slugsPath = path.join(__dirname, 'category_slugs.json');

  if (!fs.existsSync(slugsPath)) {
    console.error("categories_slugs.json not found. Run get_categories.js first!");
    process.exit(1);
  }

  const categoriesToScrape = JSON.parse(fs.readFileSync(slugsPath, 'utf-8'));

  console.log(`Loaded ${categoriesToScrape.length} categories to scrape.`);

  for (const cat of categoriesToScrape) {
    await fetchCategory(cat, 1);
  }

  console.log("Scraping complete!");
  process.exit(0);
}

main();