export interface CategoryNode {
  name: string;
  slug: string;
  subCategories?: CategoryNode[];
}

export const CATEGORY_TREE: CategoryNode[] = [
  {
    "name": "Apparel",
    "slug": "apparel",
    "subCategories": [
      {
        "name": "Tops",
        "slug": "tops",
        "subCategories": [
          { "name": "T-Shirts", "slug": "t-shirts" },
          { "name": "Hoodies & Sweatshirts", "slug": "hoodies-and-sweatshirts" },
          { "name": "Shirts", "slug": "shirts" },
          { "name": "Jerseys", "slug": "jerseys" },
          { "name": "Sweaters & Knits", "slug": "sweaters-and-knits" },
          { "name": "Tank Tops", "slug": "tank-tops" }
        ]
      },
      {
        "name": "Bottoms",
        "slug": "bottoms",
        "subCategories": [
          { "name": "Pants", "slug": "pants" },
          { "name": "Shorts", "slug": "shorts" },
          { "name": "Sweatpants", "slug": "sweatpants" },
          { "name": "Jeans", "slug": "jeans" },
          { "name": "Overalls & Coveralls", "slug": "overalls-and-coveralls" },
          { "name": "Leggings & Tights", "slug": "leggings-and-tights" },
          { "name": "Skirts", "slug": "skirts" }
        ]
      },
      {
        "name": "Outerwear",
        "slug": "outerwear",
        "subCategories": [
          { "name": "Jackets & Coats", "slug": "jackets-and-coats" },
          { "name": "Vest", "slug": "vest" }
        ]
      },
      {
        "name": "Other Apparel",
        "slug": "other-apparel",
        "subCategories": [
          { "name": "Track Suits", "slug": "track-suits" },
          { "name": "Sets & Bundles", "slug": "sets-and-bundles" },
          { "name": "Swim", "slug": "swim" },
          { "name": "Dress Suits", "slug": "dress-suits" },
          { "name": "Pajamas & Robes", "slug": "pajamas-and-robes" },
          { "name": "Bodysuits", "slug": "bodysuits" },
          { "name": "Dresses", "slug": "dresses" }
        ]
      },
      {
        "name": "Undergarments",
        "slug": "undergarments",
        "subCategories": [
          { "name": "Socks", "slug": "socks" },
          { "name": "Underwear", "slug": "underwear" },
          { "name": "Bras", "slug": "bras" }
        ]
      }
    ]
  },
  {
    "name": "Sneakers",
    "slug": "sneakers",
    "subCategories": [
      { "name": "Lifestyle", "slug": "lifestyle" },
      { "name": "Performance", "slug": "performance" },
      { "name": "Luxury", "slug": "luxury" }
    ]
  },
  {
    "name": "Shoes",
    "slug": "shoes",
    "subCategories": [
      { "name": "Cleats", "slug": "cleats" },
      { "name": "Slides & Sandals", "slug": "slides-and-sandals" },
      { "name": "Boots", "slug": "boots" },
      { "name": "Clogs", "slug": "clogs" },
      { "name": "Loafers", "slug": "loafers" },
      { "name": "Slippers", "slug": "slippers" },
      { "name": "Oxfords", "slug": "oxfords" },
      { "name": "Spikes", "slug": "spikes" },
      { "name": "Flats", "slug": "flats" },
      { "name": "Heels", "slug": "heels" },
      { "name": "Sandals", "slug": "sandals" }
    ]
  },
  {
    "name": "Accessories",
    "slug": "accessories",
    "subCategories": [
      {
        "name": "Headwear",
        "slug": "headwear",
        "subCategories": [
          { "name": "Caps", "slug": "caps" },
          { "name": "Beanies", "slug": "beanies" },
          { "name": "Bucket Hats", "slug": "bucket-hats" }
        ]
      },
      { "name": "Watches", "slug": "watches" },
      {
        "name": "Bags",
        "slug": "bags",
        "subCategories": [
          { "name": "Backpacks", "slug": "backpacks" },
          { "name": "Crossbody", "slug": "crossbody" },
          { "name": "Tote", "slug": "tote" },
          { "name": "Duffle", "slug": "duffle" },
          { "name": "Belt Bag", "slug": "belt-bag" },
          { "name": "Pouches", "slug": "pouches" },
          { "name": "Shoulder Bag", "slug": "shoulder-bag" },
          { "name": "Messenger", "slug": "messenger" },
          { "name": "Top Handle", "slug": "top-handle" },
          { "name": "Luggage", "slug": "luggage" },
          { "name": "Travel Accessories", "slug": "travel-accessories" },
          { "name": "Laptop Bags & Briefcases", "slug": "laptop-bags-and-briefcases" },
          { "name": "Clutch", "slug": "clutch" },
          { "name": "Hobo", "slug": "hobo" }
        ]
      },
      {
        "name": "Eyewear",
        "slug": "eyewear",
        "subCategories": [
          { "name": "Sunglasses", "slug": "sunglasses" },
          { "name": "Optical", "slug": "optical" },
          { "name": "Goggles", "slug": "goggles" }
        ]
      },
      {
        "name": "Wallets & Card Holders",
        "slug": "wallets-and-card-holders",
        "subCategories": [
          { "name": "Wallets", "slug": "wallets" },
          { "name": "Card Holders", "slug": "card-holders" },
          { "name": "Key Pouches", "slug": "key-pouches" },
          { "name": "Coin Pouches", "slug": "coin-pouches" }
        ]
      },
      {
        "name": "Other Accessories",
        "slug": "other-accessories",
        "subCategories": [
          { "name": "Scarves", "slug": "scarves" },
          { "name": "Gloves", "slug": "gloves" },
          { "name": "Ties", "slug": "ties" },
          { "name": "Bandana", "slug": "bandana" },
          { "name": "Water Bottles", "slug": "water-bottles" },
          { "name": "Umbrellas", "slug": "umbrellas" },
          { "name": "Slippers & Slides", "slug": "slippers-and-slides" },
          { "name": "Pet", "slug": "pet" }
        ]
      },
      { "name": "Belts", "slug": "belts" },
      {
        "name": "Jewelry",
        "slug": "jewelry",
        "subCategories": [
          { "name": "Necklaces", "slug": "necklaces" },
          { "name": "Bracelets", "slug": "bracelets" },
          { "name": "Rings", "slug": "rings" },
          { "name": "Earrings", "slug": "earrings" },
          { "name": "Brooches & Pins", "slug": "brooches-and-pins" }
        ]
      },
      {
        "name": "Home & Lifestyle",
        "slug": "home-and-lifestyle",
        "subCategories": [
          { "name": "Decorative Accessories", "slug": "decorative-accessories" },
          { "name": "Tableware", "slug": "tableware" },
          { "name": "Towels", "slug": "towels" },
          { "name": "Blankets & Pillows", "slug": "blankets-and-pillows" },
          { "name": "Furniture", "slug": "furniture" },
          { "name": "Books & Magazines", "slug": "books-and-magazines" },
          { "name": "Candles & Home Fragrance", "slug": "candles-and-home-fragrance" }
        ]
      },
      {
        "name": "Lanyards & Keychains",
        "slug": "lanyards-and-keychains",
        "subCategories": [
          { "name": "Bag Charms", "slug": "bag-charms" },
          { "name": "Keychains", "slug": "keychains" },
          { "name": "Lanyards", "slug": "lanyards" }
        ]
      },
      {
        "name": "Tech Accessories",
        "slug": "tech-accessories",
        "subCategories": [
          { "name": "iPhone Cases", "slug": "iphone-cases" },
          { "name": "Airpod Cases", "slug": "airpod-cases" },
          { "name": "Laptop & Tablet Sleeves", "slug": "laptop-and-tablet-sleeves" }
        ]
      },
      { "name": "Face Masks", "slug": "face-masks" }
    ]
  }
];

// Define which categories are "Priority" for outfit creation
const ALLOWED_SLUGS = new Set([
  // Sneakers
  "lifestyle", "performance", "luxury",
  // Shoes
  "boots", "clogs", "loafers", "oxfords", "flats", "heels", "sandals", "slides-and-sandals",
  // Apparel - Tops
  "t-shirts", "hoodies-and-sweatshirts", "shirts", "jerseys", "sweaters-and-knits", "tank-tops",
  // Apparel - Bottoms
  "pants", "shorts", "sweatpants", "jeans", "overalls-and-coveralls", "leggings-and-tights", "skirts",
  // Apparel - Outerwear
  "jackets-and-coats", "vest",
  // Apparel - Other (Select)
  "track-suits", "sets-and-bundles", "dress-suits", "bodysuits", "dresses",
  // Accessories - Headwear
  "caps", "beanies", "bucket-hats",
  // Accessories - Bags
  "backpacks", "crossbody", "tote", "duffle", "belt-bag", "shoulder-bag", "messenger", "top-handle", "clutch", "hobo",
  // Accessories - Eyewear
  "sunglasses",
  // Accessories - Belts
  "belts",
  // Accessories - Jewelry
  "necklaces", "bracelets", "rings", "earrings",
  // Accessories - Other (Select)
  "scarves", "gloves", "ties", "bandana",
  // Watches
  "watches"
]);

export function getPrioritySlugs(): string[] {
  const slugs: string[] = [];

  function traverse(nodes: CategoryNode[]) {
    for (const node of nodes) {
      if (node.subCategories && node.subCategories.length > 0) {
        traverse(node.subCategories);
      } else {
        // Leaf node
        if (ALLOWED_SLUGS.has(node.slug)) {
          slugs.push(node.slug);
        }
      }
    }
  }

  traverse(CATEGORY_TREE);
  return slugs;
}

export function getParentCategoryMap(): Map<string, string> {
  const map = new Map<string, string>();

  function traverse(nodes: CategoryNode[], parentName: string | null = null) {
    for (const node of nodes) {
      const currentVertical = parentName || node.name;

      if (node.slug) {
        map.set(node.slug, currentVertical);
      }

      if (node.subCategories) {
        traverse(node.subCategories, currentVertical);
      }
    }
  }

  traverse(CATEGORY_TREE);
  return map;
}
