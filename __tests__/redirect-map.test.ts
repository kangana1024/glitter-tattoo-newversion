import { redirectMap } from '@/lib/redirect-map';

describe('redirectMap', () => {
  it('is a non-empty record', () => {
    expect(Object.keys(redirectMap).length).toBeGreaterThan(0);
  });

  it('maps homepage variants to /', () => {
    expect(redirectMap['/home.html']).toBe('/');
    expect(redirectMap['/home_en.html']).toBe('/');
    expect(redirectMap['/home_ch.html']).toBe('/');
  });

  it('maps about variants to /about', () => {
    expect(redirectMap['/about.html']).toBe('/about');
    expect(redirectMap['/2015/about.html']).toBe('/about');
  });

  it('maps product variants to /services', () => {
    expect(redirectMap['/products']).toBe('/services');
    expect(redirectMap['/2015/products.html']).toBe('/services');
  });

  it('maps gallery variants to /gallery', () => {
    expect(redirectMap['/gallery.html']).toBe('/gallery');
  });

  it('maps contact variants to /contact', () => {
    expect(redirectMap['/contact.html']).toBe('/contact');
  });

  it('all values are valid path strings starting with /', () => {
    for (const [key, value] of Object.entries(redirectMap)) {
      expect(value).toMatch(/^\//);
    }
  });
});
