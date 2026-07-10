import React, { useEffect, useMemo, useState } from 'react';
import '../assets/admin.css';

const ADMIN_TOKEN_KEY = 'admin_token';
const DEFAULT_KALPAVRUKSHA_SITE_IMAGES = [
  { id: 'main-gate', label: 'Main gate', imageUrl: '', alt: '' },
  { id: 'compound-wall', label: 'Compound wall', imageUrl: '', alt: '' },
  { id: 'clubhouse-lawn', label: 'Clubhouse lawn', imageUrl: '', alt: '' },
  { id: 'seating-pavilion', label: 'Seating pavilion', imageUrl: '', alt: '' },
];
const KALPAVRUKSHA_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
const KALPAVRUKSHA_IMAGE_MAX_SIZE_BYTES = 6 * 1024 * 1024;

function resolveAdminImageSrc(imageUrl) {
  const url = String(imageUrl || '').trim();
  if (url.startsWith('/uploads/')) {
    return `${process.env.REACT_APP_API_URL || ''}${url}`;
  }
  return url;
}

function revokePreviewUrl(upload) {
  if (upload?.previewUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(upload.previewUrl);
  }
}

function normalizeKalpavrukshaContent(input = {}) {
  const source = Array.isArray(input.siteImages) && input.siteImages.length
    ? input.siteImages
    : DEFAULT_KALPAVRUKSHA_SITE_IMAGES;

  return {
    siteImages: source.map((item, index) => ({
      id: String(item?.id || `site-image-${index + 1}`).trim(),
      label: String(item?.label || `Site image ${index + 1}`).trim(),
      imageUrl: String(item?.imageUrl || '').trim(),
      alt: String(item?.alt || '').trim(),
    })),
  };
}

function createEmptyProperty() {
  return {
    name: '',
    location: '',
    areaRange: '',
    priceRange: '',
    status: 'Available',
    propertyType: 'Plot',
    mlsNumber: '',
    media: {
      images: [],
      workingImages: [],
      videoTours: [],
      floorPlans: [],
    },
    basicInformation: {
      lotSize: '',
      homeType: '',
      monthlyCoastEstimate: '',
      beds: '',
      baths: '',
    },
    propertyDescription: '',
    keyFeatures: [],
    exteriorFeatures: [],
    propertyInformation: {
      facing: '',
      soilType: '',
      waterSource: '',
    },
    constructionDetails: {
      approvals: '',
      permissions: '',
      restrictions: '',
    },
    marketValue: {
      currentValue: '',
      estimatedValue: '',
      pricePerSqYd: '',
    },
    neighborhoodDetails: {
      area: '',
      district: '',
      state: '',
      pincode: '',
      nearbyLandmarks: [],
    },
    utilities: {
      electricity: '',
      water: '',
      sewage: '',
      internet: '',
      gasConnection: '',
    },
    ownerAgent: {
      name: '',
      photo: '',
      phone: '',
      email: '',
      company: '',
      experience: '',
      specialization: '',
    },
    additionalInfo: {
      ageOfProperty: '',
      possession: '',
      financing: '',
      registration: '',
      amenities: [],
    },
  };
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter((item) => {
        if (typeof item === 'string') return item.length > 0;
        return Boolean(item);
      });
  }
  if (typeof value === 'string') {
    const single = value.trim();
    return single ? [single] : [];
  }
  return [];
}

function normalizeProperty(input = {}) {
  const base = createEmptyProperty();
  return {
    ...base,
    ...input,
    media: {
      ...base.media,
      ...(input.media || {}),
      images: normalizeArray(input.media?.images),
      workingImages: normalizeArray(input.media?.workingImages),
      videoTours: normalizeArray(input.media?.videoTours),
      floorPlans: normalizeArray(input.media?.floorPlans),
    },
    basicInformation: {
      ...base.basicInformation,
      ...(input.basicInformation || {}),
    },
    keyFeatures: normalizeArray(input.keyFeatures),
    exteriorFeatures: normalizeArray(input.exteriorFeatures),
    propertyInformation: {
      ...base.propertyInformation,
      ...(input.propertyInformation || {}),
    },
    constructionDetails: {
      ...base.constructionDetails,
      ...(input.constructionDetails || {}),
    },
    marketValue: {
      ...base.marketValue,
      ...(input.marketValue || {}),
    },
    neighborhoodDetails: {
      ...base.neighborhoodDetails,
      ...(input.neighborhoodDetails || {}),
      nearbyLandmarks: normalizeArray(input.neighborhoodDetails?.nearbyLandmarks),
    },
    utilities: {
      ...base.utilities,
      ...(input.utilities || {}),
    },
    ownerAgent: {
      ...base.ownerAgent,
      ...(input.ownerAgent || {}),
    },
    additionalInfo: {
      ...base.additionalInfo,
      ...(input.additionalInfo || {}),
      amenities: normalizeArray(input.additionalInfo?.amenities),
    },
  };
}

function toLines(arr) {
  if (!Array.isArray(arr)) return '';
  return arr
    .map((item) => (typeof item === 'string' ? item : ''))
    .join('\n');
}

function fromLines(text) {
  return String(text).split('\n');
}

async function apiRequest(path, options = {}) {
  const base = process.env.REACT_APP_API_URL || '';
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const res = await fetch(`${base}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...optionHeaders,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

async function uploadKalpavrukshaSiteImage(file, adminToken) {
  const base = process.env.REACT_APP_API_URL || '';
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${base}/api/admin/kalpavruksha/content/site-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || 'Failed to upload Kalpavruksha site image');
  }

  return data.data;
}

export default function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [selectedMls, setSelectedMls] = useState('__new__');
  const [originalMlsNumber, setOriginalMlsNumber] = useState('');
  const [form, setForm] = useState(createEmptyProperty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [propertyQuery, setPropertyQuery] = useState('');
  const [kalpavrukshaContent, setKalpavrukshaContent] = useState(() => normalizeKalpavrukshaContent());
  const [loadingKalpavrukshaContent, setLoadingKalpavrukshaContent] = useState(false);
  const [savingKalpavrukshaContent, setSavingKalpavrukshaContent] = useState(false);
  const [kalpavrukshaImageUploads, setKalpavrukshaImageUploads] = useState({});

  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [properties]);
  const filteredProperties = useMemo(() => {
    const query = propertyQuery.trim().toLowerCase();
    if (!query) return sortedProperties;

    const list = sortedProperties.filter((property) => {
      const label = `${property.name || ''} ${property.mlsNumber || ''}`.toLowerCase();
      return label.includes(query);
    });

    if (selectedMls !== '__new__' && !list.some((item) => item.mlsNumber === selectedMls)) {
      const selected = sortedProperties.find((item) => item.mlsNumber === selectedMls);
      return selected ? [selected, ...list] : list;
    }

    return list;
  }, [propertyQuery, selectedMls, sortedProperties]);
  const imageLinkCount = normalizeArray(form.media?.images).length;
  const workingImageLinkCount = normalizeArray(form.media?.workingImages).length;
  const featureCount = normalizeArray(form.keyFeatures).length;
  const amenityCount = normalizeArray(form.additionalInfo?.amenities).length;

  const loadProperties = async (adminToken) => {
    if (!adminToken) return;
    setLoadingProperties(true);
    setError('');

    try {
      const data = await apiRequest('/api/admin/properties', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const list = Array.isArray(data.data) ? data.data : [];
      setProperties(list);
    } catch (err) {
      setError(err.message || 'Failed to load admin properties');
      if ((err.message || '').toLowerCase().includes('token')) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken('');
      }
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadKalpavrukshaContent = async (adminToken) => {
    if (!adminToken) return;
    setLoadingKalpavrukshaContent(true);

    try {
      const data = await apiRequest('/api/admin/kalpavruksha/content', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setKalpavrukshaContent(normalizeKalpavrukshaContent(data.data));
      setKalpavrukshaImageUploads((current) => {
        Object.values(current).forEach(revokePreviewUrl);
        return {};
      });
    } catch (err) {
      setError(err.message || 'Failed to load Kalpavruksha site images');
    } finally {
      setLoadingKalpavrukshaContent(false);
    }
  };

  useEffect(() => {
    loadProperties(token);
    loadKalpavrukshaContent(token);
  }, [token]);

  const handleSelectProperty = (mlsNumber) => {
    setSelectedMls(mlsNumber);
    setError('');
    setSuccess('');
    setPropertyQuery('');

    if (mlsNumber === '__new__') {
      setOriginalMlsNumber('');
      setForm(createEmptyProperty());
      return;
    }

    const selected = properties.find((item) => item.mlsNumber === mlsNumber);
    if (!selected) return;

    setOriginalMlsNumber(selected.mlsNumber);
    setForm(normalizeProperty(selected));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setPassword('');
      setSuccess('Admin login successful.');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setProperties([]);
    setSelectedMls('__new__');
    setOriginalMlsNumber('');
    setForm(createEmptyProperty());
    setKalpavrukshaContent(normalizeKalpavrukshaContent());
    setKalpavrukshaImageUploads((current) => {
      Object.values(current).forEach(revokePreviewUrl);
      return {};
    });
    setError('');
    setSuccess('');
  };

  const updateForm = (path, value) => {
    setForm((prev) => {
      const next = normalizeProperty(prev);
      const parts = path.split('.');
      let cursor = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        const key = parts[i];
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
      }
      cursor[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleResetForm = () => {
    setError('');
    setSuccess('');

    if (selectedMls === '__new__') {
      setForm(createEmptyProperty());
      return;
    }

    const selected = properties.find((item) => item.mlsNumber === selectedMls);
    if (!selected) {
      setForm(createEmptyProperty());
      return;
    }

    setForm(normalizeProperty(selected));
    setOriginalMlsNumber(selected.mlsNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = normalizeProperty(form);
      const response = await apiRequest('/api/admin/properties/upsert', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalMlsNumber: originalMlsNumber || undefined,
          property: payload,
        }),
      });

      const updatedList = Array.isArray(response.data) ? response.data : [];
      setProperties(updatedList);
      setOriginalMlsNumber(payload.mlsNumber);
      setSelectedMls(payload.mlsNumber);
      setSuccess(`Property ${response.action}.`);
    } catch (err) {
      setError(err.message || 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const updateKalpavrukshaSiteImage = (index, field, value) => {
    setKalpavrukshaContent((current) => ({
      ...current,
      siteImages: current.siteImages.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const handleKalpavrukshaSiteImageFile = (index, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for Kalpavruksha site images.');
      return;
    }

    if (file.size > KALPAVRUKSHA_IMAGE_MAX_SIZE_BYTES) {
      setError('Kalpavruksha site image must be 6MB or smaller.');
      return;
    }

    const imageId = kalpavrukshaContent.siteImages[index]?.id;
    if (!imageId) return;

    setError('');
    setSuccess('');
    setKalpavrukshaImageUploads((current) => {
      revokePreviewUrl(current[imageId]);
      const previewUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(file)
        : '';
      return {
        ...current,
        [imageId]: {
          file,
          previewUrl,
        },
      };
    });
  };

  const handleUseDefaultKalpavrukshaSiteImage = (index) => {
    const imageId = kalpavrukshaContent.siteImages[index]?.id;
    updateKalpavrukshaSiteImage(index, 'imageUrl', '');
    if (!imageId) return;
    setKalpavrukshaImageUploads((current) => {
      const next = { ...current };
      revokePreviewUrl(next[imageId]);
      delete next[imageId];
      return next;
    });
  };

  const addKalpavrukshaSiteImage = () => {
    setKalpavrukshaContent((current) => {
      if (current.siteImages.length >= 12) return current;
      const nextIndex = current.siteImages.length + 1;
      return {
        ...current,
        siteImages: [
          ...current.siteImages,
          { id: `site-image-${Date.now()}`, label: `Site image ${nextIndex}`, imageUrl: '', alt: '' },
        ],
      };
    });
  };

  const removeKalpavrukshaSiteImage = (index) => {
    const imageId = kalpavrukshaContent.siteImages[index]?.id;
    setKalpavrukshaContent((current) => ({
      ...current,
      siteImages: current.siteImages.filter((_, itemIndex) => itemIndex !== index),
    }));
    if (!imageId) return;
    setKalpavrukshaImageUploads((current) => {
      const next = { ...current };
      revokePreviewUrl(next[imageId]);
      delete next[imageId];
      return next;
    });
  };

  const handleKalpavrukshaContentSubmit = async (event) => {
    event.preventDefault();
    setSavingKalpavrukshaContent(true);
    setError('');
    setSuccess('');

    try {
      const normalized = normalizeKalpavrukshaContent(kalpavrukshaContent);
      const siteImages = [];

      for (const item of normalized.siteImages) {
        const pendingUpload = kalpavrukshaImageUploads[item.id];
        if (!pendingUpload?.file) {
          siteImages.push(item);
          continue;
        }

        const uploadedImage = await uploadKalpavrukshaSiteImage(pendingUpload.file, token);
        siteImages.push({
          ...item,
          imageUrl: uploadedImage.imageUrl || item.imageUrl,
        });
      }

      const payload = { ...normalized, siteImages };
      const response = await apiRequest('/api/admin/kalpavruksha/content', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setKalpavrukshaContent(normalizeKalpavrukshaContent(response.data));
      setKalpavrukshaImageUploads((current) => {
        Object.values(current).forEach(revokePreviewUrl);
        return {};
      });
      setSuccess('Kalpavruksha site images updated for V1, V2, and mobile.');
    } catch (err) {
      setError(err.message || 'Failed to save Kalpavruksha site images');
    } finally {
      setSavingKalpavrukshaContent(false);
    }
  };

  if (!token) {
    return (
      <div className="admin-panel">
        <div className="admin-card admin-card-small admin-auth-shell">
          <p className="admin-kicker">Administration</p>
          <h1>Admin Login</h1>
          <p className="admin-subtext">Sign in to manage listings, media links, and property content.</p>
          <form onSubmit={handleLogin} className="admin-form">
            <div className="admin-field">
              <label htmlFor="admin-username">Username</label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="admin-alert admin-alert-error">{error}</p>}
            <button type="submit" className="primary-btn">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-card">
        <div className="admin-top">
          <div>
            <p className="admin-kicker">Administration</p>
            <h1>Property Management</h1>
            <p className="admin-subtext">
              Select an existing listing or create a new one. Saving updates the property data store.
            </p>
          </div>
          <div className="admin-meta">
            <span className="admin-pill">{properties.length} properties</span>
            <button type="button" className="secondary-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <form className="admin-kalpavruksha-panel" onSubmit={handleKalpavrukshaContentSubmit}>
          <div className="admin-kalpavruksha-heading">
            <div>
              <h2>Kalpavruksha Live Site Images</h2>
              <p className="admin-section-note">
                Upload site images and labels once for V1, V2, and mobile. Using the default keeps the packaged site image.
              </p>
            </div>
            <button type="button" className="secondary-btn" onClick={addKalpavrukshaSiteImage}>
              Add Site Image
            </button>
          </div>

          {loadingKalpavrukshaContent ? (
            <p className="admin-loading">Loading Kalpavruksha site images...</p>
          ) : (
            <div className="admin-site-image-list">
              {kalpavrukshaContent.siteImages.map((item, index) => (
                <div className="admin-site-image-row" key={item.id}>
                  <div className="admin-site-image-preview">
                    {kalpavrukshaImageUploads[item.id]?.previewUrl || item.imageUrl ? (
                      <img src={kalpavrukshaImageUploads[item.id]?.previewUrl || resolveAdminImageSrc(item.imageUrl)} alt="" />
                    ) : (
                      <span>Default image</span>
                    )}
                  </div>
                  <div className="admin-field">
                    <label htmlFor={`kalpa-site-label-${index}`}>Label</label>
                    <input
                      id={`kalpa-site-label-${index}`}
                      value={item.label}
                      onChange={(event) => updateKalpavrukshaSiteImage(index, 'label', event.target.value)}
                      maxLength={80}
                      required
                    />
                  </div>
                  <div className="admin-field admin-site-image-file">
                    <label htmlFor={`kalpa-site-file-${index}`}>Image file</label>
                    <input
                      id={`kalpa-site-file-${index}`}
                      type="file"
                      accept={KALPAVRUKSHA_IMAGE_ACCEPT}
                      onChange={(event) => handleKalpavrukshaSiteImageFile(index, event.target.files?.[0])}
                    />
                    <span className="admin-helper">
                      {kalpavrukshaImageUploads[item.id]?.file?.name || (item.imageUrl ? 'Uploaded image saved' : 'Default packaged image')}
                    </span>
                    {(kalpavrukshaImageUploads[item.id] || item.imageUrl) && (
                      <button
                        type="button"
                        className="secondary-btn admin-use-default-image-btn"
                        onClick={() => handleUseDefaultKalpavrukshaSiteImage(index)}
                      >
                        Use Default Image
                      </button>
                    )}
                  </div>
                  <div className="admin-field admin-site-image-alt">
                    <label htmlFor={`kalpa-site-alt-${index}`}>Image alt text</label>
                    <input
                      id={`kalpa-site-alt-${index}`}
                      value={item.alt}
                      onChange={(event) => updateKalpavrukshaSiteImage(index, 'alt', event.target.value)}
                      maxLength={180}
                      placeholder="Optional accessibility description"
                    />
                  </div>
                  <button
                    type="button"
                    className="secondary-btn admin-remove-image-btn"
                    onClick={() => removeKalpavrukshaSiteImage(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="admin-kalpavruksha-actions">
            <button type="submit" className="primary-btn" disabled={savingKalpavrukshaContent || loadingKalpavrukshaContent}>
              {savingKalpavrukshaContent ? 'Saving...' : 'Save Site Images'}
            </button>
          </div>
        </form>

        <div className="admin-selection-panel">
          <div className="admin-field">
            <label htmlFor="property-search">Search Property</label>
            <input
              id="property-search"
              type="text"
              value={propertyQuery}
              onChange={(e) => setPropertyQuery(e.target.value)}
              placeholder="Search by property name or MLS number"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="property-select">Select Property</label>
            <select
              id="property-select"
              value={selectedMls}
              onChange={(e) => handleSelectProperty(e.target.value)}
            >
              <option value="__new__">Add New Property</option>
              {filteredProperties.map((property) => (
                <option key={property.mlsNumber} value={property.mlsNumber}>
                  {property.name} ({property.mlsNumber})
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="secondary-btn" onClick={() => handleSelectProperty('__new__')}>
            Create New
          </button>
        </div>

        {loadingProperties ? (
          <p className="admin-loading">Loading properties...</p>
        ) : (
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-sections">
              <section className="admin-section admin-section-wide">
                <h2>Basic Details</h2>
                <p className="admin-section-note">These are used in cards, filters, and property details.</p>
                <div className="admin-grid">
                  <div className="admin-field">
                    <label htmlFor="mlsNumber">MLS Number</label>
                    <input
                      id="mlsNumber"
                      value={form.mlsNumber}
                      onChange={(e) => updateForm('mlsNumber', e.target.value)}
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="name">Property Name</label>
                    <input
                      id="name"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="status">Status</label>
                    <input
                      id="status"
                      value={form.status}
                      onChange={(e) => updateForm('status', e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="propertyType">Property Type</label>
                    <input
                      id="propertyType"
                      value={form.propertyType}
                      onChange={(e) => updateForm('propertyType', e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="priceRange">Price Range</label>
                    <input
                      id="priceRange"
                      value={form.priceRange}
                      onChange={(e) => updateForm('priceRange', e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="areaRange">Area Range</label>
                    <input
                      id="areaRange"
                      value={form.areaRange}
                      onChange={(e) => updateForm('areaRange', e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="admin-section admin-section-wide">
                <h2>Location & Description</h2>
                <div className="admin-field">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="description">Property Description</label>
                  <textarea
                    id="description"
                    className="admin-textarea-large"
                    rows="4"
                    value={form.propertyDescription}
                    onChange={(e) => updateForm('propertyDescription', e.target.value)}
                  />
                </div>
              </section>

              <section className="admin-section">
                <h2>Media Links</h2>
                <p className="admin-section-note">Use one image URL per line.</p>
                <div className="admin-field">
                  <div className="admin-label-row">
                    <label htmlFor="images">Image Links</label>
                    <span className="admin-helper">{imageLinkCount} links</span>
                  </div>
                  <textarea
                    id="images"
                    rows="8"
                    value={toLines(form.media?.images)}
                    onChange={(e) => updateForm('media.images', fromLines(e.target.value))}
                    placeholder="https://example.com/image-1.jpg"
                  />
                </div>

                <div className="admin-field">
                  <div className="admin-label-row">
                    <label htmlFor="working-images">Working Image Links</label>
                    <span className="admin-helper">{workingImageLinkCount} links</span>
                  </div>
                  <textarea
                    id="working-images"
                    rows="8"
                    value={toLines(form.media?.workingImages)}
                    onChange={(e) => updateForm('media.workingImages', fromLines(e.target.value))}
                    placeholder="https://example.com/working-image-1.jpg"
                  />
                </div>
              </section>

              <section className="admin-section">
                <h2>Features & Amenities</h2>
                <p className="admin-section-note">Use one item per line for easier editing.</p>
                <div className="admin-field">
                  <div className="admin-label-row">
                    <label htmlFor="features">Key Features</label>
                    <span className="admin-helper">{featureCount} items</span>
                  </div>
                  <textarea
                    id="features"
                    rows="6"
                    value={toLines(form.keyFeatures)}
                    onChange={(e) => updateForm('keyFeatures', fromLines(e.target.value))}
                  />
                </div>

                <div className="admin-field">
                  <div className="admin-label-row">
                    <label htmlFor="amenities">Amenities</label>
                    <span className="admin-helper">{amenityCount} items</span>
                  </div>
                  <textarea
                    id="amenities"
                    rows="6"
                    value={toLines(form.additionalInfo?.amenities)}
                    onChange={(e) => updateForm('additionalInfo.amenities', fromLines(e.target.value))}
                  />
                </div>
              </section>
            </div>

            <div className="admin-feedback">
              {error && <p className="admin-alert admin-alert-error">{error}</p>}
              {success && <p className="admin-alert admin-alert-success">{success}</p>}
            </div>

            <div className="admin-actions">
              <button type="button" className="secondary-btn" onClick={handleResetForm}>
                Reset Changes
              </button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Property'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
