import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProducts } from './useProducts';
import { api } from '../services/apiClient';

vi.mock('../services/apiClient', () => ({
  api: {
    getProducts: vi.fn(),
  },
}));

const getProductsMock = api.getProducts as unknown as ReturnType<typeof vi.fn>;

describe('useProducts', () => {
  beforeEach(() => {
    getProductsMock.mockReset();
    getProductsMock.mockResolvedValue({ data: [], total: 0 });
  });

  it('fetches products without filters by default', async () => {
    renderHook(() => useProducts());
    await waitFor(() => {
      expect(getProductsMock).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  it('passes category and search to the API', async () => {
    renderHook(() => useProducts('Coffee', 'espresso'));
    await waitFor(() => {
      expect(getProductsMock).toHaveBeenCalledWith('Coffee', 'espresso');
    });
  });

  it('re-fetches when search term changes', async () => {
    const { rerender } = renderHook(
      ({ search }: { search: string | undefined }) => useProducts(undefined, search),
      { initialProps: { search: undefined as string | undefined } },
    );

    await waitFor(() => {
      expect(getProductsMock).toHaveBeenLastCalledWith(undefined, undefined);
    });

    rerender({ search: 'mug' });

    await waitFor(() => {
      expect(getProductsMock).toHaveBeenLastCalledWith(undefined, 'mug');
    });
  });
});
