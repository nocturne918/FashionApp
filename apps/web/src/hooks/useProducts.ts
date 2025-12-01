import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@fashionapp/shared';
import { api } from '../services/api';

interface UseProductsOptions {
  limit?: number;
  search?: string;
  category?: string | string[];
  department?: string;
  parentCategory?: string;
  brand?: string;
}

export const useProducts = (initialOptions: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async (options: UseProductsOptions & { page: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getProducts(options);
      setProducts(prev => options.page === 1 ? response.data : [...prev, ...response.data]);
      setTotal(response.meta.total);
      setHasMore(response.meta.page < response.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and filter changes
  useEffect(() => {
    setPage(1);
    fetchProducts({ ...initialOptions, page: 1 });
  }, [
    initialOptions.search,
    // For category, support array or string
    Array.isArray(initialOptions.category) ? initialOptions.category.join(',') : initialOptions.category,
    initialOptions.department,
    initialOptions.parentCategory,
    initialOptions.brand,
    fetchProducts
  ]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts({ ...initialOptions, page: nextPage });
    }
  };

  return {
    products,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    refresh: () => fetchProducts({ ...initialOptions, page: 1 })
  };
};
