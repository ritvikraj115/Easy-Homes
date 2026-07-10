import {
  captureGoogleAdsAttributionFromLocation,
  getGoogleAdsAttributionPayload,
} from './googleAdsAttribution';

beforeEach(() => {
  window.localStorage.clear();
});

test('captures Google Ads attribution from the normal query before a hash', () => {
  const payload = captureGoogleAdsAttributionFromLocation({
    search: '?gclid=query-click&utm_campaign=query-campaign',
    hash: '#book',
    href: 'https://easyhomess.com/kalpavruksha/?gclid=query-click&utm_campaign=query-campaign#book',
  });

  expect(payload).toEqual(expect.objectContaining({
    gclid: 'query-click',
    clickIdType: 'gclid',
    hasGoogleAdsClick: true,
    campaignId: 'query-campaign',
    utmCampaign: 'query-campaign',
    landingPage: 'https://easyhomess.com/kalpavruksha/',
  }));
});

test('captures Google Ads attribution when params are placed inside the hash', () => {
  captureGoogleAdsAttributionFromLocation({
    search: '',
    hash: '#book?gclid=hash-click&utm_campaign=hash-campaign',
    href: 'https://easyhomess.com/kalpavruksha/#book?gclid=hash-click&utm_campaign=hash-campaign',
  });

  expect(getGoogleAdsAttributionPayload()).toEqual(expect.objectContaining({
    gclid: 'hash-click',
    clickIdType: 'gclid',
    hasGoogleAdsClick: true,
    campaignId: 'hash-campaign',
    utmCampaign: 'hash-campaign',
    landingPage: 'https://easyhomess.com/kalpavruksha/',
  }));
});

test('normal query attribution overrides duplicate hash attribution', () => {
  const payload = captureGoogleAdsAttributionFromLocation({
    search: '?gclid=query-click&utm_campaign=query-campaign',
    hash: '#download-layout?gclid=hash-click&utm_campaign=hash-campaign',
    href: 'https://easyhomess.com/kalpavruksha/?gclid=query-click&utm_campaign=query-campaign#download-layout?gclid=hash-click&utm_campaign=hash-campaign',
  });

  expect(payload).toEqual(expect.objectContaining({
    gclid: 'query-click',
    campaignId: 'query-campaign',
    utmCampaign: 'query-campaign',
  }));
});
