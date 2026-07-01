import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import KalpavrukshaPage from './Kalpavruksha';
import api from '../api';
import {
  trackEvent,
  trackWhatsAppClick,
} from '../utils/analytics';

jest.setTimeout(15000);

const mockNavigate = jest.fn();
let mockPathname = '/kalpavruksha/';
let mockHash = '';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../utils/analytics', () => ({
  trackEvent: jest.fn(),
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
      hash: mockHash,
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
  api.get.mockResolvedValue({ data: { success: true, slots: ['9:00 AM', '10:00 AM'] } });
  api.post.mockResolvedValue({ data: { ok: true } });
  mockPathname = '/kalpavruksha/';
  mockHash = '';
  mockNavigate.mockImplementation((to) => {
    mockPathname = typeof to === 'string' ? to : to?.pathname || mockPathname;
  });
  process.env.REACT_APP_MAP_KEY = 'test-map-key';
  
  window.history.pushState({}, '', '/kalpavruksha/');

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

  Object.defineProperty(window, 'open', {
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

  fireEvent.click(screen.getAllByRole('button', { name: 'Get Current Price on WhatsApp' })[0]);

  expect(trackWhatsAppClick).toHaveBeenCalledWith(
    expect.objectContaining({
      landing_variant: 'A',
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement: 'hero_price_whatsapp',
    }),
  );
});

test('zoho salesiq widget script is added when live chat is opened', () => {
  renderPage();

  fireEvent.click(screen.getAllByRole('button', { name: 'Start Live Chat' })[0]);

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

test('conversion-first sections show verified project essentials near the top', () => {
  renderPage();

  expect(screen.getByRole('button', { name: 'Book Free Site Visit' })).toBeInTheDocument();
  expect(screen.getAllByText('CRDA Approved').length).toBeGreaterThan(0);
  expect(screen.getByText('RERA Approved')).toBeInTheDocument();
  expect(screen.getByText('Buyer Essentials')).toBeInTheDocument();
  expect(screen.getByText('Honest Availability')).toBeInTheDocument();
  expect(screen.getAllByText('Rs. 30 Lakhs').length).toBeGreaterThan(0);
  expect(screen.getAllByText('P06160035909').length).toBeGreaterThan(0);
  expect(screen.getAllByText('September 2026').length).toBeGreaterThan(0);
  expect(screen.getByText('17')).toBeInTheDocument();
});

test('site visit hash link opens the form directly for ad landing flows', async () => {
  mockHash = '#site-visit';

  renderPage();

  expect(await screen.findByRole('heading', { name: 'Book a Site Visit' })).toBeInTheDocument();
  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      form_name: 'kalpavruksha_site_visit_form',
      lead_type: 'site_visit',
      source: 'hash_site_visit',
    }),
  );
});

test('brochure hash link opens the brochure form directly', async () => {
  mockHash = '#brochure';

  renderPage();

  expect(await screen.findByRole('heading', { name: 'Download Project Brochure' })).toBeInTheDocument();
  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'brochure_download',
      source: 'hash_brochure',
    }),
  );
});

test('location hash link scrolls to the location section', () => {
  mockHash = '#location';

  renderPage();
  act(() => {
    jest.runOnlyPendingTimers();
  });

  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
});

test('amenities hash link scrolls to the amenities section', () => {
  mockHash = '#amenities';

  renderPage();
  act(() => {
    jest.runOnlyPendingTimers();
  });

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

  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(
    screen.getByText('Please enter your name and phone number.'),
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
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(await screen.findByText('Pick a suitable slot')).toBeInTheDocument();

  fireEvent.change(siteVisitForm.querySelector('input[name="preferredDate"]'), {
    target: { name: 'preferredDate', value: '2099-01-01' },
  });
  fireEvent.click(await screen.findByRole('button', { name: '9:00 AM' }));

  await act(async () => {
    fireEvent.submit(siteVisitForm);
  });

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/api/site-visits', {
      project: 'Kalpavruksha',
      name: 'Test User',
      phone: '9876543210',
      email: undefined,
      interest: 'Book Visit',
      preferredDate: '2099-01-01T09:00',
      transportRequired: 'No',
      notes: 'Site visit scheduled from website.\nLanding Variant: A\nWebsite Version: v1\nInterest: Book Visit',
      platformSource: 'Website',
      platform_source: 'website',
      landingVariant: 'A',
      landing_variant: 'A',
      landingVersion: 'v1',
      landing_version: 'v1',
      version: 'v1',
      pickupAddress: undefined,
      pickupMode: undefined,
      pickupLat: undefined,
      pickupLng: undefined,
      googleAdsAttribution: undefined,
    });
  });

  expect(trackEvent).toHaveBeenCalledWith(
    'book_site_visit_submitted',
    expect.objectContaining({
      form_name: 'kalpavruksha_site_visit_form',
      conversion_type: 'book_site_visit',
      lead_status: 'Visit Scheduled',
      landing_variant: 'A',
      landing_version: 'v1',
    }),
  );
  expect(trackEvent).not.toHaveBeenCalledWith('form_submit', expect.anything());
  expect(trackEvent).not.toHaveBeenCalledWith('generate_lead', expect.anything());
  expect(trackEvent).not.toHaveBeenCalledWith('schedule_visit', expect.anything());
  expect(mockNavigate).toHaveBeenCalledWith('/thank-you');
});

test('site visit map pickup mode can populate the pickup address', async () => {
  renderPage();

  fireEvent.click(screen.getAllByRole('button', { name: 'Schedule a Visit' })[0]);
  const siteVisitForm = document.querySelector('form');
  fireEvent.change(siteVisitForm.querySelector('input[name="name"]'), {
    target: { name: 'name', value: 'Pickup User' },
  });
  fireEvent.change(siteVisitForm.querySelector('input[name="phone"]'), {
    target: { name: 'phone', value: '9876543210' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

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

  fireEvent.click(screen.getByRole('button', { name: 'Download Project Brochure' }));

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
      platformSource: 'Website',
      platform_source: 'website',
      landingVariant: 'A',
      landing_variant: 'A',
      landingVersion: 'v1',
      landing_version: 'v1',
      version: 'v1',
      leadStatus: 'Downloaded Brochure',
      name: 'Brochure User',
      phone: '9123456789',
      email: undefined,
      googleAdsAttribution: undefined,
    });
  });

  expect(trackEvent).toHaveBeenCalledWith(
    'brochure_downloaded',
    expect.objectContaining({
      form_name: 'kalpavruksha_download_form',
      conversion_type: 'brochure_download',
      lead_type: 'brochure_download',
      landing_variant: 'A',
      landing_version: 'v1',
    }),
  );
  expect(trackEvent).not.toHaveBeenCalledWith('form_submit', expect.anything());
  expect(trackEvent).not.toHaveBeenCalledWith('generate_lead', expect.anything());
  expect(trackEvent).not.toHaveBeenCalledWith('file_download', expect.anything());
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

test('gallery modal next and previous controls keep sliding through images', () => {
  renderPage();

  fireEvent.click(
    screen.getByAltText('Kalpavruksha grand entrance for the CRDA-approved plotted community in Vijayawada'),
  );

  expect(screen.getByText('1 / 6')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Show next gallery image' }));
  expect(screen.getByText('2 / 6')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Show next gallery image' }));
  expect(screen.getByText('3 / 6')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Show previous gallery image' }));
  expect(screen.getByText('2 / 6')).toBeInTheDocument();
});

test('location keeps the shared directions link and no longer renders the travel map', () => {
  renderPage();

  expect(screen.queryByTestId('travel-map')).not.toBeInTheDocument();
  const locationDirectionsLink = screen.getAllByRole('link', { name: /Get Directions/i })[0];
  expect(locationDirectionsLink).toHaveAttribute('href', 'https://maps.app.goo.gl/dNA1KdiDNuLjTthG8');
});

test('floating action icons become available after the hero is scrolled', async () => {
  const restoreLayout = mockScrolledHeroLayout();
  renderPage();

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open brochure download' })).toBeInTheDocument();
  });

  expect(screen.queryByRole('button', { name: /Quick Actions/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open WhatsApp chat' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open live chat' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Open brochure download' }));

  expect(await screen.findByRole('heading', { name: 'Download Project Brochure' })).toBeInTheDocument();
  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'brochure_download',
      project: 'Kalpavruksha',
    }),
  );
  restoreLayout();
});
