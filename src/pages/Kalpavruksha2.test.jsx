import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import KalpavrukshaPage from './Kalpavruksha';
import KalpavrukshaV2 from './KalpavrukshaV2';
import KalpavrukshaMobileUx from './KalpavrukshaMobileUx';
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
  trackPageView: jest.fn(),
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
  api.get.mockResolvedValue({
    data: { success: true, slots: ['9:00 AM', '10:00 AM'], availabilityStatus: 'live' },
  });
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

  expect(screen.getByText('Residential Plots near Vijayawada, close to Amaravati')).toBeInTheDocument();

  fireEvent.click(screen.getAllByLabelText('Show next slide')[0]);
  act(() => {
    jest.advanceTimersByTime(200);
  });

  expect(await screen.findByText('Trust begins with clarity')).toBeInTheDocument();

  fireEvent.click(screen.getAllByLabelText('Show previous slide')[0]);
  act(() => {
    jest.advanceTimersByTime(200);
  });

  expect(await screen.findByText('Residential Plots near Vijayawada, close to Amaravati')).toBeInTheDocument();
});

test('hero price CTA scrolls to the brochure and map form', () => {
  renderPage();

  window.scrollTo.mockClear();
  fireEvent.click(screen.getAllByRole('button', { name: 'Location & Project Details' })[0]);

  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      landing_variant: 'A',
      project: 'Kalpavruksha',
      source: 'hero_price_location_cta',
      form_name: 'kalpavruksha_download_form',
      lead_type: 'brochure_download',
    }),
  );
  expect(trackEvent).not.toHaveBeenCalledWith('brochure_map_cta_click', expect.anything());
  expect(trackWhatsAppClick).not.toHaveBeenCalled();
  expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({
    behavior: 'smooth',
  }));
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

  expect(screen.getAllByRole('button', { name: 'Location & Project Details' }).length).toBeGreaterThan(0);
  expect(screen.getByText('What makes Kalpavruksha different')).toBeInTheDocument();
  expect(screen.getByText('Built for buyers who value transparency, lifestyle, and long-term appreciation.')).toBeInTheDocument();
  expect(screen.getByText('Sunrise framed by the hills')).toBeInTheDocument();
  expect(screen.queryByText("What's inside the layout")).not.toBeInTheDocument();
  expect(screen.queryByText('Clear buyer transparency')).not.toBeInTheDocument();
  expect(screen.getByText('Buyer Essentials')).toBeInTheDocument();
  expect(screen.queryByText('Honest Availability')).not.toBeInTheDocument();
  expect(screen.getAllByText('Rs. 31 Lakhs').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Rs. 31 Lakhs onwards').length).toBeGreaterThan(0);
  expect(screen.getAllByText('September 2026').length).toBeGreaterThan(0);
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

  expect(await screen.findByRole('heading', { name: 'Location & Project Details' })).toBeInTheDocument();
  act(() => {
    jest.advanceTimersByTime(150);
  });
  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'brochure_download',
      source: 'hash_brochure',
    }),
  );
});

test('book hash link opens the V1 location and project details form directly', () => {
  mockHash = '#book';

  renderPage();

  act(() => {
    jest.advanceTimersByTime(150);
  });

  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'brochure_download',
      source: 'hash_book',
    }),
  );
  expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({
    behavior: 'smooth',
  }));
});

test('layout download hash opens the V1 layout lead form directly', async () => {
  mockHash = '#download-layout';

  renderPage();

  act(() => {
    jest.advanceTimersByTime(150);
  });

  expect(await screen.findByRole('heading', { name: 'Download Master Layout PDF' })).toBeInTheDocument();
  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'master_layout_download',
      source: 'hash_layout_download',
      asset_type: 'master_layout',
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
    screen.getByText('Please enter your name, phone number, and email address.'),
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
  fireEvent.change(siteVisitForm.querySelector('input[name="email"]'), {
    target: { name: 'email', value: 'bad-email' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  act(() => {
    jest.runOnlyPendingTimers();
  });
  fireEvent.change(siteVisitForm.querySelector('input[name="email"]'), {
    target: { name: 'email', value: 'test.user@example.com' },
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
      email: 'test.user@example.com',
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
      slotAvailabilityIssue: false,
      slotAvailabilityIssueReason: undefined,
      slotAvailabilitySource: 'zoho_live',
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
  expect(mockNavigate).toHaveBeenCalledWith('/thank-you?type=site-visit');
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
  fireEvent.change(siteVisitForm.querySelector('input[name="email"]'), {
    target: { name: 'email', value: 'pickup.user@example.com' },
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

test('site visit keeps fallback slots active when Zoho availability cannot load', async () => {
  api.get.mockImplementation((url) => {
    if (url === '/api/site-visits/available-slots') {
      return Promise.reject(new Error('Zoho availability timed out'));
    }
    return Promise.resolve({ data: { success: true, data: { siteImages: [] } } });
  });

  renderPage();
  fireEvent.click(screen.getAllByRole('button', { name: 'Schedule a Visit' })[0]);

  const siteVisitForm = document.querySelector('form');
  fireEvent.change(siteVisitForm.querySelector('input[name="name"]'), {
    target: { name: 'name', value: 'Fallback User' },
  });
  fireEvent.change(siteVisitForm.querySelector('input[name="phone"]'), {
    target: { name: 'phone', value: '9876543210' },
  });
  fireEvent.change(siteVisitForm.querySelector('input[name="email"]'), {
    target: { name: 'email', value: 'fallback.user@example.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.change(siteVisitForm.querySelector('input[name="preferredDate"]'), {
    target: { name: 'preferredDate', value: '2099-01-02' },
  });

  fireEvent.click(await screen.findByRole('button', { name: '10:15 AM' }));
  await act(async () => {
    fireEvent.submit(siteVisitForm);
  });

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/api/site-visits', expect.objectContaining({
      preferredDate: '2099-01-02T10:15',
      slotAvailabilityIssue: true,
      slotAvailabilityIssueReason: 'Zoho availability timed out',
      slotAvailabilitySource: 'fallback',
    }));
  });
});

test('brochure and map request submits the lead without a client-side download', async () => {
  renderPage();

  fireEvent.click(screen.getAllByRole('button', { name: 'Location & Project Details' })[0]);

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
      leadStatus: 'Brochure and Map Requested on WhatsApp',
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
      conversion_type: 'brochure_map_requested',
      lead_type: 'brochure_map_request',
      landing_variant: 'A',
      landing_version: 'v1',
    }),
  );
  expect(trackEvent).not.toHaveBeenCalledWith('form_submit', expect.anything());
  expect(trackEvent).not.toHaveBeenCalledWith('generate_lead', expect.anything());
  expect(trackEvent).not.toHaveBeenCalledWith('file_download', expect.anything());
  expect(mockNavigate).toHaveBeenCalledWith('/thank-you?type=brochure-map', expect.objectContaining({
    state: expect.objectContaining({
      thankYouType: 'brochure-map',
      leadType: 'brochure_map_request',
    }),
  }));
});

test('gallery cards use descriptive alt text for SEO and accessibility', () => {
  renderPage();

  expect(
    screen.getAllByAltText('Kalpavruksha clubhouse exterior with landscaped lawns and premium lifestyle amenities').length,
  ).toBeGreaterThan(0);
  expect(
    screen.getAllByAltText('Kalpavruksha lotus pond water feature with curved walkways and reflective landscaping').length,
  ).toBeGreaterThan(0);
});

test('gallery modal next and previous controls keep sliding through images', () => {
  renderPage();

  fireEvent.click(
    screen.getAllByAltText('Kalpavruksha clubhouse exterior with landscaped lawns and premium lifestyle amenities')[0],
  );

  expect(screen.getByText('1 / 3')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Show next gallery image' }));
  expect(screen.getByText('2 / 3')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Show next gallery image' }));
  expect(screen.getByText('3 / 3')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Show previous gallery image' }));
  expect(screen.getByText('2 / 3')).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: 'Go to location and project details form' })).toBeInTheDocument();
  });

  expect(screen.queryByRole('button', { name: /Quick Actions/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open WhatsApp chat' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open live chat' })).toBeInTheDocument();

  window.scrollTo.mockClear();
  fireEvent.click(screen.getByRole('button', { name: 'Go to location and project details form' }));

  expect(trackEvent).toHaveBeenCalledWith(
    'form_open',
    expect.objectContaining({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'brochure_download',
      project: 'Kalpavruksha',
      source: 'floating_brochure_icon',
    }),
  );
  expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({
    behavior: 'smooth',
  }));
  restoreLayout();
});

test('admin-managed site image and label replace the packaged V1 live-site image', async () => {
  api.get.mockImplementation((url) => {
    if (url === '/api/kalpavruksha/content') {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            siteImages: [{
              id: 'main-gate',
              label: 'July main gate update',
              imageUrl: 'https://images.example.com/kalpa-main-gate.webp',
              alt: 'Admin-managed live site image',
            }],
          },
        },
      });
    }
    return Promise.resolve({ data: { success: true, slots: [], availabilityStatus: 'live' } });
  });

  renderPage();

  expect(await screen.findByAltText('Admin-managed live site image')).toHaveAttribute(
    'src',
    'https://images.example.com/kalpa-main-gate.webp',
  );
  expect(screen.getByText('July main gate update')).toBeInTheDocument();
});

test('V2 price CTA uses the established brochure download GTM contract', () => {
  render(
    <HelmetProvider>
      <KalpavrukshaV2 />
    </HelmetProvider>,
  );

  fireEvent.click(screen.getAllByRole('button', { name: 'Location & Project Details' })[0]);

  expect(trackEvent).toHaveBeenCalledWith('form_open', expect.objectContaining({
    form_name: 'kalpavruksha_download_form',
    lead_type: 'brochure_download',
    landing_variant: 'B',
  }));
  expect(trackEvent).not.toHaveBeenCalledWith('brochure_map_cta_click', expect.anything());
});

test('book hash link opens the V2 location and project details form directly', () => {
  mockPathname = '/kalpavruksha/';
  mockHash = '#book';

  render(
    <HelmetProvider>
      <KalpavrukshaV2 />
    </HelmetProvider>,
  );

  act(() => {
    jest.advanceTimersByTime(150);
  });

  expect(trackEvent).toHaveBeenCalledWith('form_open', expect.objectContaining({
    form_name: 'kalpavruksha_download_form',
    lead_type: 'brochure_download',
    landing_variant: 'B',
    source: 'hash_book',
  }));
  expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({
    behavior: 'smooth',
  }));
});

test('download layout hash opens the V2 layout lead form before downloading', async () => {
  mockPathname = '/kalpavruksha/';
  mockHash = '#download-layout';

  render(
    <HelmetProvider>
      <KalpavrukshaV2 />
    </HelmetProvider>,
  );

  act(() => {
    jest.advanceTimersByTime(150);
  });

  expect(await screen.findByRole('heading', { name: 'Download Layout PDF' })).toBeInTheDocument();
  expect(trackEvent).toHaveBeenCalledWith('form_open', expect.objectContaining({
    form_name: 'kalpavruksha_download_form',
    lead_type: 'master_layout_download',
    landing_variant: 'B',
    source: 'hash_layout_download',
    asset_type: 'master_layout',
  }));
  expect(trackEvent).not.toHaveBeenCalledWith('master_layout_downloaded', expect.anything());
  expect(api.post).not.toHaveBeenCalled();
});

test('V2 layout download submits lead, fires the existing GTM event, then redirects', async () => {
  mockPathname = '/kalpavruksha/';

  render(
    <HelmetProvider>
      <KalpavrukshaV2 />
    </HelmetProvider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Download Layout PDF' }));

  const layoutForm = await screen.findByRole('heading', { name: 'Download Layout PDF' })
    .then(() => document.getElementById('layout-download'));

  expect(trackEvent).toHaveBeenCalledWith('form_open', expect.objectContaining({
    form_name: 'kalpavruksha_download_form',
    lead_type: 'master_layout_download',
    landing_variant: 'B',
    source: 'lp_b_master_plan',
  }));
  expect(trackEvent).not.toHaveBeenCalledWith('master_layout_downloaded', expect.anything());

  fireEvent.change(layoutForm.querySelector('input[name="name"]'), {
    target: { name: 'name', value: 'Layout User' },
  });
  fireEvent.change(layoutForm.querySelector('input[name="phone"]'), {
    target: { name: 'phone', value: '9123456789' },
  });
  fireEvent.change(layoutForm.querySelector('input[name="email"]'), {
    target: { name: 'email', value: 'layout.user@example.com' },
  });

  await act(async () => {
    fireEvent.submit(layoutForm);
  });

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/api/leads/layout-download', expect.objectContaining({
      project: 'Kalpavruksha',
      source: 'Website',
      landingVariant: 'B',
      landing_variant: 'B',
      landingVersion: 'v2',
      landing_version: 'v2',
      leadStatus: 'Downloaded Layout',
      name: 'Layout User',
      phone: '9123456789',
      email: 'layout.user@example.com',
    }));
  });
  expect(trackEvent).toHaveBeenCalledWith('master_layout_downloaded', expect.objectContaining({
    conversion_type: 'master_layout_download',
    lead_type: 'master_layout_download',
    landing_variant: 'B',
    landing_version: 'v2',
    placement: 'lp_b_master_plan',
    asset_type: 'master_layout',
  }));
  expect(mockNavigate).toHaveBeenCalledWith('/thank-you');
});

test('book hash link scrolls the shared mobile form directly', () => {
  mockHash = '#book';

  render(
    <HelmetProvider>
      <KalpavrukshaMobileUx landingVariant="A" landingVersion="v1" />
    </HelmetProvider>,
  );

  act(() => {
    jest.advanceTimersByTime(150);
  });

  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({
    behavior: 'smooth',
    block: 'start',
  }));
  expect(trackEvent).toHaveBeenCalledWith('form_open', expect.objectContaining({
    form_name: 'kalpavruksha_download_form',
    lead_type: 'brochure_download',
    placement: 'hash_book',
  }));
});

test('mobile brochure form uses the shared lead endpoint and brochure_downloaded event', async () => {
  render(
    <HelmetProvider>
      <KalpavrukshaMobileUx landingVariant="A" landingVersion="v1" />
    </HelmetProvider>,
  );

  fireEvent.change(screen.getByLabelText('Your name'), {
    target: { name: 'name', value: 'Mobile User' },
  });
  fireEvent.change(screen.getByLabelText('Phone number'), {
    target: { name: 'phone', value: '9876543210' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send Location & Project Details on WhatsApp' }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/api/leads/layout-download', expect.objectContaining({
      project: 'Kalpavruksha',
      name: 'Mobile User',
      phone: '9876543210',
      leadStatus: 'Brochure and Map Requested on WhatsApp',
    }));
  });
  expect(trackEvent).toHaveBeenCalledWith('brochure_downloaded', expect.objectContaining({
    form_name: 'kalpavruksha_download_form',
    conversion_type: 'brochure_map_requested',
    landing_variant: 'A',
  }));
  expect(trackEvent).not.toHaveBeenCalledWith('generate_lead', expect.anything());
});
