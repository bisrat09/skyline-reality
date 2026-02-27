import React from 'react';

const Cal = (props: Record<string, unknown>) =>
  React.createElement('div', { 'data-testid': 'cal-embed', ...props });

export const getCalApi = jest.fn().mockResolvedValue(jest.fn());

export default Cal;
