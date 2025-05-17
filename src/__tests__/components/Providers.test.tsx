import React from 'react';
import { render, act } from '@testing-library/react';
import Providers from '@/app/providers';

describe('Providers component', () => {
  it('renders children correctly', async () => {
    let renderResult: ReturnType<typeof render>;
    
    await act(async () => {
      renderResult = render(
        <Providers>
          <div>Test Child</div>
        </Providers>
      );
    });
    
    expect(renderResult.getByText('Test Child')).toBeInTheDocument();
  });
}); 