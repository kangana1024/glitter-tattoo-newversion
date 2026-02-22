import * as fs from 'fs';
import * as path from 'path';
import { loadPageContent, getAvailablePages } from '@/lib/content';

// Mock fs module
jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('loadPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the content cache between tests by re-requiring
  });

  it('returns placeholder when file does not exist', () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = loadPageContent('nonexistent', 'en');
    expect(result.title).toBe('Nonexistent');
    expect(result.description).toBe('');
    expect(result.headings).toEqual([]);
    expect(result.bodyText).toBe('');
    expect(result.images).toEqual([]);
  });

  it('returns localized content for matching locale', () => {
    const mockData = {
      name: 'about',
      title: { en: 'About Us', th: 'เกี่ยวกับเรา' },
      description: { en: 'English desc', th: 'Thai desc' },
      sections: [
        { locale: 'en', headings: ['H1'], bodyText: 'Body EN', images: [] },
        { locale: 'th', headings: ['H1 TH'], bodyText: 'Body TH', images: [] },
      ],
      images: [{ src: '/img.jpg', alt: 'image' }],
    };

    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    const result = loadPageContent('about', 'en');
    expect(result.title).toBe('About Us');
    expect(result.description).toBe('English desc');
    expect(result.bodyText).toBe('Body EN');
  });

  it('falls back to th locale when requested locale is missing', () => {
    const mockData = {
      name: 'services',
      title: { th: 'Thai title' },
      description: { th: 'Thai desc' },
      sections: [
        { locale: 'th', headings: ['H1'], bodyText: 'Thai body', images: [] },
      ],
      images: [],
    };

    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    const result = loadPageContent('services', 'zh');
    expect(result.title).toBe('Thai title');
    expect(result.description).toBe('Thai desc');
    expect(result.bodyText).toBe('Thai body');
  });

  it('sets ogImage from first image', () => {
    const mockData = {
      name: 'gallery',
      title: { en: 'Gallery' },
      description: { en: 'Desc' },
      sections: [
        {
          locale: 'en',
          headings: [],
          bodyText: '',
          images: [{ src: '/photo.jpg', alt: 'photo' }],
        },
      ],
      images: [],
    };

    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    const result = loadPageContent('gallery', 'en');
    expect(result.ogImage).toBe('/photo.jpg');
  });
});

describe('getAvailablePages', () => {
  it('returns page names from directory listing', () => {
    mockFs.readdirSync.mockReturnValue(
      ['about.json', 'contact.json', 'gallery.json'] as unknown as fs.Dirent[],
    );

    const pages = getAvailablePages();
    expect(pages).toEqual(['about', 'contact', 'gallery']);
  });

  it('returns empty array when directory does not exist', () => {
    mockFs.readdirSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const pages = getAvailablePages();
    expect(pages).toEqual([]);
  });
});
