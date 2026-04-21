import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewForm } from './ReviewForm';

describe('ReviewForm', () => {
  it('requires a rating before submitting', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText(/your review/i);
    fireEvent.change(textarea, { target: { value: 'Nice product' } });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    expect(await screen.findByText(/select a rating/i)).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires non-empty text', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    expect(await screen.findByText(/write a short review/i)).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits rating and trimmed text when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('radio', { name: '5 stars' }));
    fireEvent.change(screen.getByLabelText(/your review/i), {
      target: { value: '  Excellent product  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ rating: 5, text: 'Excellent product' });
    });
  });

  it('rejects text shorter than 10 characters', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    fireEvent.change(screen.getByLabelText(/your review/i), {
      target: { value: 'Too short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    expect(await screen.findByText(/at least 10 characters/i)).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects text containing HTML tags', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    fireEvent.change(screen.getByLabelText(/your review/i), {
      target: { value: 'This is a <script>alert("xss")</script> review text' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    expect(await screen.findByText(/html.*not allowed/i)).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
