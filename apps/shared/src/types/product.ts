export interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  brand: string;
  release_date: string;
  vote_average: string;
  style_id: string;
  poster_path: string;
  tittle?: string;
}

export interface ProductFilters {
  suggestion: boolean;
  weather: boolean;
  trending: boolean;
  price: boolean;
  [key: string]: boolean; // For any additional filter options
}
