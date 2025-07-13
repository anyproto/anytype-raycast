import { describe, expect, it } from 'vitest';
import { getCustomTypeIcon, getMaskForObject } from './icon';
import { Image, Icon } from '@raycast/api';
import { ObjectLayout } from '../models';

describe('getCustomTypeIcon', () => {
  it('should return icon with color tint', () => {
    const icon = getCustomTypeIcon('document', 'blue');
    expect(icon).toEqual({
      source: 'icons/type/document.svg',
      tintColor: {
        light: '#3e58eb',
        dark: '#3e58eb',
      },
    });
  });

  it('should use grey color when no color is specified', () => {
    const icon = getCustomTypeIcon('layers');
    expect(icon).toEqual({
      source: 'icons/type/layers.svg',
      tintColor: {
        light: '#b6b6b6',
        dark: '#b6b6b6',
      },
    });
  });

  it('should use grey color when undefined color is passed', () => {
    const icon = getCustomTypeIcon('checkbox', undefined);
    expect(icon).toEqual({
      source: 'icons/type/checkbox.svg',
      tintColor: {
        light: '#b6b6b6',
        dark: '#b6b6b6',
      },
    });
  });

  it('should handle different icon names', () => {
    const testCases = [
      { name: 'person', color: 'red', expectedColor: '#f55522' },
      { name: 'bookmark', color: 'lime', expectedColor: '#5dd400' },
      { name: 'extension-puzzle', color: 'yellow', expectedColor: '#ecd91b' },
      { name: 'copy', color: 'purple', expectedColor: '#ab50cc' },
    ];

    testCases.forEach(({ name, color, expectedColor }) => {
      const icon = getCustomTypeIcon(name, color);
      expect(icon).toEqual({
        source: `icons/type/${name}.svg`,
        tintColor: {
          light: expectedColor,
          dark: expectedColor,
        },
      });
    });
  });

  it('should handle unknown colors by falling back to grey', () => {
    const icon = getCustomTypeIcon('document', 'unknown-color');
    expect(icon).toEqual({
      source: 'icons/type/document.svg',
      tintColor: {
        light: undefined,
        dark: undefined,
      },
    });
  });
});

describe('getMaskForObject', () => {
  it('should return Circle mask for Participant layout', () => {
    const icon = { source: 'some-icon.png' };
    const mask = getMaskForObject(icon, ObjectLayout.Participant);
    expect(mask).toBe(Image.Mask.Circle);
  });

  it('should return Circle mask for Profile layout', () => {
    const icon = { source: 'some-icon.png' };
    const mask = getMaskForObject(icon, ObjectLayout.Profile);
    expect(mask).toBe(Image.Mask.Circle);
  });

  it('should return RoundedRectangle mask for other layouts', () => {
    const testLayouts = [
      ObjectLayout.Basic,
      ObjectLayout.Action,
      ObjectLayout.Note,
      ObjectLayout.Bookmark,
      ObjectLayout.Set,
      ObjectLayout.Collection,
      'custom-layout',
      '',
    ];

    testLayouts.forEach((layout) => {
      const icon = { source: 'some-icon.png' };
      const mask = getMaskForObject(icon, layout);
      expect(mask).toBe(Image.Mask.RoundedRectangle);
    });
  });

  it('should return RoundedRectangle mask when icon is Icon.Document regardless of layout', () => {
    const mask = getMaskForObject(Icon.Document, ObjectLayout.Participant);
    expect(mask).toBe(Image.Mask.RoundedRectangle);
  });

  it('should return RoundedRectangle mask when icon is Icon.Document for Profile layout', () => {
    const mask = getMaskForObject(Icon.Document, ObjectLayout.Profile);
    expect(mask).toBe(Image.Mask.RoundedRectangle);
  });

  it('should handle string icons', () => {
    const mask = getMaskForObject('😀', ObjectLayout.Participant);
    expect(mask).toBe(Image.Mask.Circle);
  });

  it('should handle complex icon objects', () => {
    const icon = {
      source: 'icon.png',
      mask: Image.Mask.Circle,
      tintColor: { light: '#000', dark: '#fff' }
    };
    const mask = getMaskForObject(icon, ObjectLayout.Basic);
    expect(mask).toBe(Image.Mask.RoundedRectangle);
  });
});
