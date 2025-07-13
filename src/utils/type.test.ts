import { describe, expect, it, vi, beforeEach } from 'vitest';
import { 
  fetchTypeKeysForPages, 
  fetchTypesKeysForTasks, 
  fetchTypeKeysForLists,
  fetchAllTypesForSpace,
  getAllTypesFromSpaces,
  fetchAllTemplatesForType
} from './type';
import { Space, Type, ObjectLayout } from '../models';
import * as api from '../api';

// Mock the API module
vi.mock('../api', () => ({
  getTypes: vi.fn(),
  getTemplates: vi.fn(),
}));

// Mock bundledTypeKeys
vi.mock('./constant', () => ({
  apiLimitMax: 1000,
  bundledTypeKeys: {
    audio: 'ot-audio',
    chat: 'ot-chat',
    file: 'ot-file',
    image: 'ot-image',
    object_type: 'ot-objectType',
    tag: 'ot-tag',
    template: 'ot-template',
    video: 'ot-video',
    set: 'ot-set',
    collection: 'ot-collection',
    bookmark: 'ot-bookmark',
    participant: 'ot-participant',
  },
}));

describe('fetchTypeKeysForPages', () => {
  const mockSpaces: Space[] = [
    { id: 'space1', name: 'Space 1' } as Space,
    { id: 'space2', name: 'Space 2' } as Space,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no types exist', async () => {
    vi.mocked(api.getTypes).mockResolvedValue({
      types: [],
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual([]);
  });

  it('should exclude bundled type keys', async () => {
    const mockTypes: Type[] = [
      { key: 'ot-page', layout: ObjectLayout.Basic } as Type,
      { key: 'ot-note', layout: ObjectLayout.Note } as Type,
      { key: 'ot-audio', layout: ObjectLayout.Basic } as Type, // Should be excluded
      { key: 'ot-tag', layout: ObjectLayout.Basic } as Type, // Should be excluded
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(['ot-page', 'ot-note']);
    expect(result).not.toContain('ot-audio');
    expect(result).not.toContain('ot-tag');
  });

  it('should exclude task type keys', async () => {
    const mockTypes: Type[] = [
      { key: 'ot-page', layout: ObjectLayout.Basic } as Type,
      { key: 'ot-task', layout: ObjectLayout.Action } as Type,
      { key: 'ot-custom-task', layout: ObjectLayout.Action } as Type,
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const taskKeys = ['ot-task', 'ot-custom-task'];
    const result = await fetchTypeKeysForPages(mockSpaces, taskKeys, []);
    expect(result).toEqual(['ot-page']);
  });

  it('should exclude list type keys', async () => {
    const mockTypes: Type[] = [
      { key: 'ot-page', layout: ObjectLayout.Basic } as Type,
      { key: 'ot-kanban', layout: ObjectLayout.Set } as Type,
      { key: 'ot-gallery', layout: ObjectLayout.Collection } as Type,
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const listKeys = ['ot-kanban', 'ot-gallery'];
    const result = await fetchTypeKeysForPages(mockSpaces, [], listKeys);
    expect(result).toEqual(['ot-page']);
  });

  it('should return unique type keys', async () => {
    const mockTypes: Type[] = [
      { key: 'ot-page', layout: ObjectLayout.Basic } as Type,
      { key: 'ot-page', layout: ObjectLayout.Basic } as Type, // Duplicate
      { key: 'ot-note', layout: ObjectLayout.Note } as Type,
      { key: 'ot-note', layout: ObjectLayout.Note } as Type, // Duplicate
    ];

    vi.mocked(api.getTypes).mockResolvedValueOnce({
      types: mockTypes.slice(0, 2),
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    }).mockResolvedValueOnce({
      types: mockTypes.slice(2),
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(['ot-page', 'ot-note']);
  });

  it('should handle multiple spaces', async () => {
    const space1Types: Type[] = [
      { key: 'ot-page', layout: ObjectLayout.Basic } as Type,
      { key: 'ot-note', layout: ObjectLayout.Note } as Type,
    ];
    const space2Types: Type[] = [
      { key: 'ot-blog', layout: ObjectLayout.Basic } as Type,
      { key: 'ot-article', layout: ObjectLayout.Basic } as Type,
    ];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: space1Types,
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      })
      .mockResolvedValueOnce({
        types: space2Types,
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(expect.arrayContaining(['ot-page', 'ot-note', 'ot-blog', 'ot-article']));
    expect(result).toHaveLength(4);
  });

  it('should handle pagination', async () => {
    const firstBatch: Type[] = [
      { key: 'ot-page1', layout: ObjectLayout.Basic } as Type,
    ];
    const secondBatch: Type[] = [
      { key: 'ot-page2', layout: ObjectLayout.Basic } as Type,
    ];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: firstBatch,
        pagination: { total: 2, offset: 0, limit: 1000, has_more: true },
      })
      .mockResolvedValueOnce({
        types: secondBatch,
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      });

    const result = await fetchTypeKeysForPages([mockSpaces[0]], [], []);
    expect(result).toEqual(expect.arrayContaining(['ot-page1', 'ot-page2']));
    expect(result).toHaveLength(2);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: [{ key: 'ot-page', layout: ObjectLayout.Basic } as Type],
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      })
      .mockRejectedValueOnce(new Error('API Error'));

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(['ot-page']); // Should still return results from successful space
  });

  it('should exclude all layout-specific types', async () => {
    const mockTypes: Type[] = [
      { key: 'ot-page', layout: ObjectLayout.Basic } as Type,
      { key: 'ot-set', layout: ObjectLayout.Set } as Type, // Excluded
      { key: 'ot-collection', layout: ObjectLayout.Collection } as Type, // Excluded
      { key: 'ot-bookmark', layout: ObjectLayout.Bookmark } as Type, // Excluded
      { key: 'ot-participant', layout: ObjectLayout.Participant } as Type, // Excluded
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(['ot-page']);
  });
});