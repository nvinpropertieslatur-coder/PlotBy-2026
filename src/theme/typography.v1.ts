// @ts-nocheck
import { Platform } from 'react-native';

const typographyV1 = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: 'Inter, Poppins, sans-serif',
    default: 'sans-serif',
  }),

  // =========================
  // HEADINGS
  // =========================

  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },

  h1Large: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },

  h1XLarge: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 46,
  },

  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },

  h2Large: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },

  h3: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },

  // =========================
  // BODY
  // =========================

  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 25,
  },

  bodyMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },

  bodyMediumLarge: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 23,
  },

  // =========================
  // SMALL TEXT
  // =========================

  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  },

  captionLarge: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
  },

  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  labelLarge: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },

  // =========================
  // BUTTON
  // =========================

  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  buttonLarge: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },

  // =========================
  // PRICE
  // =========================

  price: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },

  priceLarge: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },

  priceXLarge: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
};

export default typographyV1;