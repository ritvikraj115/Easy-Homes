import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Routes: () => <div data-testid="app-routes" />,
  Route: () => null,
  Navigate: () => null,
  useLocation: () => ({ pathname: '/', search: '' }),
}), { virtual: true });

jest.mock('./utils/analytics', () => ({
  trackPageView: jest.fn(),
}));

jest.mock('./utils/googleAdsAttribution', () => ({
  captureGoogleAdsAttributionFromLocation: jest.fn(),
}));

test('renders the application route shell', () => {
  window.scrollTo = jest.fn();
  render(<App />);
  expect(screen.getByTestId('app-routes')).toBeInTheDocument();
});
