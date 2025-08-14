export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const SITE_PROTOCOL = IS_PRODUCTION ? 'https' : 'http';

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'example.com';
export const SITE_NAME = 'Image Text Composer';

export const ROOT_URL = `${SITE_PROTOCOL}://${ROOT_DOMAIN}`;

export const GOOGLE_ANALYTICS = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
