import React from 'react';
import { act, render } from '@testing-library/react';
import KalpavrukshaDirectDownload from './KalpavrukshaDirectDownload';
import { trackEvent } from '../utils/analytics';
import {
  captureGoogleAdsAttributionFromLocation,
  getGoogleAdsAttributionPayload,
} from '../utils/googleAdsAttribution';

const mockNavigate = jest.fn();
let mockPathname = '/kalpavruksha/brochure';

jest.mock(
  'react-router-dom',
  () => ({
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

jest.mock('../utils/analytics', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../utils/googleAdsAttribution', () => ({
  captureGoogleAdsAttributionFromLocation: jest.fn(),
  getGoogleAdsAttributionPayload: jest.fn(),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  getGoogleAdsAttributionPayload.mockReturnValue({
    hasGoogleAdsClick: true,
    clickIdType: 'gclid',
    campaignId: '123',
    gclid: 'test-gclid',
  });
  Object.defineProperty(window, 'open', {
    writable: true,
    value: jest.fn(),
  });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('brochure direct route downloads the brochure and fires the existing brochure event', () => {
  mockPathname = '/kalpavruksha/brochure';
  const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  render(<KalpavrukshaDirectDownload assetKey="brochure" />);

  expect(captureGoogleAdsAttributionFromLocation).toHaveBeenCalled();
  expect(clickSpy).toHaveBeenCalled();
  expect(trackEvent).toHaveBeenCalledWith('brochure_downloaded', expect.objectContaining({
    conversion_type: 'brochure_download',
    form_name: 'kalpavruksha_download_form',
    lead_type: 'brochure_download',
    project: 'Kalpavruksha',
    source: 'direct_download_link',
    asset_type: 'brochure',
    link_url: '/mainBrouche.pdf',
    delivery_channel: 'direct_download',
    gclid: 'test-gclid',
  }));

  act(() => {
    jest.advanceTimersByTime(400);
  });

  expect(window.open).toHaveBeenCalledWith('/mainBrouche.pdf', '_blank', 'noopener,noreferrer');

  act(() => {
    jest.advanceTimersByTime(900);
  });

  expect(mockNavigate).toHaveBeenCalledWith('/kalpavruksha/', { replace: true });
});

test('masterplan direct route downloads the master layout and fires the existing layout event', () => {
  mockPathname = '/kalpavruksha/masterplan';
  const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  render(<KalpavrukshaDirectDownload assetKey="masterplan" />);

  expect(clickSpy).toHaveBeenCalled();
  expect(trackEvent).toHaveBeenCalledWith('master_layout_downloaded', expect.objectContaining({
    conversion_type: 'master_layout_download',
    form_name: 'kalpavruksha_download_form',
    lead_type: 'master_layout_download',
    project: 'Kalpavruksha',
    source: 'direct_download_link',
    asset_type: 'master_layout',
    link_url: '/Kalpavruksha Master Layout.pdf',
    delivery_channel: 'direct_download',
  }));

  act(() => {
    jest.advanceTimersByTime(400);
  });

  expect(window.open).toHaveBeenCalledWith('/Kalpavruksha Master Layout.pdf', '_blank', 'noopener,noreferrer');
});
