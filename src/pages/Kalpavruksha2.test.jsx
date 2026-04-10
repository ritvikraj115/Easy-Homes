import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import KalpavrukshaPage from '../../../Kalpavruksha2';
import api from '../api';
import {
  trackEvent,
  trackFileDownload,
  trackGenerateLead,
  trackScheduleVisit,
  trackWhatsAppClick,
} from '../utils/analytics';

const mockNavigate = jest.fn();
let mockPathname = '/kalpavruksha2/';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('../utils/analytics', () => ({
  trackEvent: jest.fn(),
  trackFileDownload: jest.fn(),
  trackGenerateLead: jest.fn(),
  trackScheduleVisit: jest.fn(),
  trackWhatsAppClick: jest.fn(),
}));

jest.mock('../components/ReviewProject', () => () => <div data-testid="reviews-widget">Reviews</div>);
jest.mock('../components/PickupLocationMap', () => (props) => (
  <button
    type="button"
    data-testid="pickup-map"
    onClick={() =>
      props.onMapClick?.({
        latLng: {
          lat: () => 16.601081,
          lng: () => 80.597972,
        },
      })
    }
  >
    Mock Pickup Map
  </button>
));
jest.mock('../components/TravelTimesLocationMap', () => () => <div data-testid="travel-map">Travel map</div>);
jest.mock('../components/YouTubeLiteEmbed', () => (props) => (
  <div data-testid="youtube-lite-embed">{props.title}</div>
));
jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children, to, ...props }) => (
      <a href={typeof to === 'string' ? to : to?.pathname || '/'} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: mockPathname,
      search: '',
      hash: '',
      state: null,
    }),
  }),
  { virtual: true },
);

function createIntersectionObserverMock() {
  return class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe(target) {
      this.callback([{ isIntersecting: true, target }]);
    }

    unobserve() {}

    disconnect() {}
  };
}

function renderPage() {
  return render(
    <HelmetProvider>
      <KalpavrukshaPage />
    </HelmetProvider>,
  );
}

function mockScrolledHeroLayout() {
  const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

  HTMLElement.prototype.getBoundingClientRect = function mockRect() {
    if (
      this.tagName === 'SECTION' &&
      String(this.className).includes('min-h-[100svh]')
    ) {
      return {
        top: -24,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: -24,
        toJSON: () => ({}),
      };
    }

    if (typeof originalGetBoundingClientRect === 'function') {
      return originalGetBoundingClientRect.call(this);
    }

    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  };

  return () => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  api.post.mockResolvedValue({ data: { ok: true } });
  mockPathname = '/kalpavruksha2/';
  mockNavigate.mockImplementation((to) => {
    mockPathname = typeof to === 'string' ? to : to?.pathname || mockPathname;
  });
  process.env.REACT_APP_MAP_KEY = 'test-map-key';
  
  window.history.pushState({}, '', '/kalpavruksha2/');

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
  });

  Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: (callback) => {
      callback();
      return 1;
    },
  });

  Object.defineProperty(window, 'cancelAnimationFrame', {
    writable: true,
    value: jest.fn(),
  });

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: createIntersectionObserverMock(),
  });

  delete window.$zoho;
  document.getElementById('zsiqscript')?.remove();
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  delete window.$zoho;
  document.getElementById('zsiqscript')?.remove();
});

test('hero next/previous controls change slides', async () => {
  renderPage();

  expect(screen.getByText("Where You Don't Just Arrive - You Belong")).toBeInTheDocument();

  fireEvent.click(screen.getAllByLabelText('Show next slide')[0]);
  act(() => {
    jest.advanceTimersByTime(200);
  });

  expect(await screen.findByText('Trust begins with clarity')).toBeInTheDocument();

  fireEvent.click(screen.getAllByLabelText('Show previous slide')[0]);
  act(() => {
    jest.advanceTimersByTime(200);
  });

  expect(await screen.findByText("Where You Don't Just Arrive - You Belong")).toBeInTheDocument();
});

test('hero WhatsApp CTA tracks the same placement flow as Kalpa', () => {
  renderPage();

  fireEvent.click(screen.getAllByRole('link', { name: 'Talk to Us on WhatsApp' })[0]);

  expect(trackWhatsAppClick).toHaveBeenCalledWith({
    project: 'Kalpavruksha',
    source: 'kalpavruksha',
    placement: 'hero_cta',
  });
});

test('zoho salesiq widget script is added on kalpavruksha2 page', () => {
  renderPage();

  const widgetScript = document.getElementById('zsiqscript');

  expect(widgetScript).not.toBeNull();
  expect(widgetScript).toHaveAttribute(
    'src',
    'https://salesiq.zohopublic.in/widget?wc=siq79be0a217878e0446b69dce568ecb00ecb77d7f8f0f8e11c5824d0d15aa2db43',
  );
});

test('project nav links scroll to the matching section', () => {
  renderPage();
  HTMLElement.prototype.scrollIntoView.mockClear();

  fireEvent.click(screen.getAllByRole('button', { name: 'Location' })[0]);

  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
});

test('hero discover more control scrolls to the next section', () => {
  renderPage();
  HTMLElement.prototype.scrollIntoView.mockClear();

  fireEvent.click(screen.getAllByRole('button', { name: 'Discover More' })[0]);

  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  expect(screen.queryByText('Download Master Layout PDF')).not.toBeInTheDocument();
});

test('site visit form validates and submits successfully', async () => {
  renderPage();

  fireEvent.click(screen.getAllByRole('button', { name: 'Schedule a Visit' })[0]);

  fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
  expect(
    screen.getByText('Please fill name, phone, date and time slot.'),
  ).toBeInTheDocument();
  act(() => {
    jest.runOnlyPendingTimers();
  });

  const siteVisitForm = document.querySelector('form');
  fireEvent.change(siteVisitForm.querySelector('input[name="name"]'), {
    target: { name: 'name', value: 'Test User' },
  });
  fireEvent.change(siteVisitForm.querySelector('input[name="phone"]'), {
    target: { name: 'phone', value: '9876543210' },
  });
  fireEvent.change(siteVisitForm.querySelector('input[name="preferredDate"]'), {
    target: { name: 'preferredDate', value: '2099-01-01' },
  });
  fireEvent.click(screen.getByRole('button', { name: '9:00 AM' }));

  await act(async () => {
    fireEvent.submit(siteVisitForm);
  });

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/api/site-visits', {
      project: 'Kalpavruksha',
      name: 'Test User',
      phone: '9876543210',
      email: undefined,
      preferredDate: '2099-01-01T09:00',
      transportRequired: 'No',
      notes: 'Site visit scheduled from website.',
      pickupAddress: undefined,
      pickupMode: undefined,
      pickupLat: undefined,
      pickupLng: undefined,
    });
  });

  expect(trackGenerateLead).toHaveBeenCalled();
  expect(trackScheduleVisit).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('/thank-you');
});

test('site visit map pickup mode can populate the pickup address', async () => {
  renderPage();

  fireEvent.click(screen.getAllByRole('button', { name: 'Schedule a Visit' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
  fireEvent.click(screen.getByText('Select on Map'));
  fireEvent.click(await screen.findByTestId('pickup-map'));

  await waitFor(() => {
    expect(document.querySelector('textarea[name="pickupAddress"]')).toHaveValue(
      'Selected location near 16.601081, 80.597972',
    );
  });
});

test('brochure download form submits and triggers the file download flow', async () => {
  const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  renderPage();

  fireEvent.click(screen.getByRole('button', { name: 'Download Brochure' }));

  const downloadForm = document.querySelector('form');
  fireEvent.change(downloadForm.querySelector('input[name="name"]'), {
    target: { name: 'name', value: 'Brochure User' },
  });
  fireEvent.change(downloadForm.querySelector('input[name="phone"]'), {
    target: { name: 'phone', value: '9123456789' },
  });

  await act(async () => {
    fireEvent.submit(downloadForm);
  });

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/api/leads/layout-download', {
      project: 'Kalpavruksha',
      source: 'Website',
      leadStatus: 'Downloaded Brochure',
      name: 'Brochure User',
      phone: '9123456789',
      email: undefined,
    });
  });

  expect(trackGenerateLead).toHaveBeenCalled();
  expect(trackFileDownload).toHaveBeenCalled();
  expect(anchorClickSpy).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('/thank-you');

  anchorClickSpy.mockRestore();
});

test('gallery cards use descriptive alt text for SEO and accessibility', () => {
  renderPage();

  expect(
    screen.getByAltText('Kalpavruksha grand entrance for the CRDA-approved plotted community in Vijayawada'),
  ).toBeInTheDocument();
  expect(
    screen.getByAltText('Kalpavruksha clubhouse exterior with landscaped lawns and premium lifestyle amenities'),
  ).toBeInTheDocument();
});

test('location and quick action directions use the exact shared map URL', async () => {
  const restoreLayout = mockScrolledHeroLayout();
  const { container } = renderPage();

  const locationDirectionsLink = screen.getAllByRole('link', { name: /Get Directions/i })[0];
  expect(locationDirectionsLink).toHaveAttribute('href', 'https://maps.app.goo.gl/dNA1KdiDNuLjTthG8');

  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: /Quick Actions/i }).length).toBeGreaterThan(0);
  });
  fireEvent.click(screen.getAllByRole('button', { name: /Quick Actions/i })[0]);

  const quickActionsPanel = container.querySelector('#kalpavruksha-quick-actions');
  expect(quickActionsPanel).not.toBeNull();

  const quickActionsDirectionsLink = within(quickActionsPanel).getByRole('link', { name: /Get Directions/i });
  expect(quickActionsDirectionsLink).toHaveAttribute('href', 'https://maps.app.goo.gl/dNA1KdiDNuLjTthG8');
  restoreLayout();
});

test('quick actions become available after the hero is scrolled and can open the layout modal', async () => {
  const restoreLayout = mockScrolledHeroLayout();
  const { container } = renderPage();

  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: /Quick Actions/i }).length).toBeGreaterThan(0);
  });
  fireEvent.click(screen.getAllByRole('button', { name: /Quick Actions/i })[0]);

  const quickActionsPanel = container.querySelector('#kalpavruksha-quick-actions');
  const layoutButton = within(quickActionsPanel).getByRole('button', { name: /Download Layout PDF/i });
  fireEvent.click(layoutButton);

  expect(await screen.findByText('Download Master Layout PDF')).toBeInTheDocument();
  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'master_layout_download',
      project: 'Kalpavruksha',
    }),
  );
  restoreLayout();
});
