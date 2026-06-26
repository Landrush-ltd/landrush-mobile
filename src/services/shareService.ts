import { Share, Linking, Platform } from 'react-native';
import type { Listing } from '../types/listing';

export interface ShareOptions {
  title: string;
  message: string;
  url: string;
}

/**
 * Generate shareable content for a listing
 */
export function generateShareContent(listing: Listing): ShareOptions {
  const listingUrl = `https://www.landrushafrica.com/listings/${listing.id}`;

  const title = listing.title;
  const message = `🏡 ${listing.title}\n\n` +
    `📍 ${listing.location}, ${listing.state}\n` +
    `💰 ₦${listing.price.toLocaleString()} ${listing.priceUnit}\n` +
    `📐 ${listing.size} ${listing.sizeUnit}\n\n` +
    `Check it out on Landrush:\n${listingUrl}`;

  return { title, message, url: listingUrl };
}

/**
 * Share to WhatsApp
 */
export async function shareToWhatsApp(listing: Listing): Promise<void> {
  try {
    const { message, url } = generateShareContent(listing);
    const text = encodeURIComponent(`${message}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;

    const supported = await Linking.canOpenURL(whatsappUrl);
    if (supported) {
      await Linking.openURL(whatsappUrl);
    } else {
      throw new Error('WhatsApp not installed');
    }
  } catch (error) {
    throw new Error('Failed to share to WhatsApp: ' + (error as Error).message);
  }
}

/**
 * Share to Facebook
 */
export async function shareToFacebook(listing: Listing): Promise<void> {
  try {
    const { url, title } = generateShareContent(listing);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;

    const supported = await Linking.canOpenURL(facebookUrl);
    if (supported) {
      await Linking.openURL(facebookUrl);
    } else {
      throw new Error('Cannot open Facebook');
    }
  } catch (error) {
    throw new Error('Failed to share to Facebook: ' + (error as Error).message);
  }
}

/**
 * Share to Twitter/X
 */
export async function shareToTwitter(listing: Listing): Promise<void> {
  try {
    const { url } = generateShareContent(listing);
    const text = `Check out this ${listing.category} property: ${listing.title} in ${listing.state} 🏡\n\nPrice: ₦${listing.price.toLocaleString()} ${listing.priceUnit}\n\nFind more on Landrush:`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    const supported = await Linking.canOpenURL(twitterUrl);
    if (supported) {
      await Linking.openURL(twitterUrl);
    } else {
      throw new Error('Cannot open Twitter');
    }
  } catch (error) {
    throw new Error('Failed to share to Twitter: ' + (error as Error).message);
  }
}

/**
 * Share to Instagram (limited - opens Instagram app, user manually adds link to bio)
 */
export async function shareToInstagram(listing: Listing): Promise<void> {
  try {
    const { message } = generateShareContent(listing);

    // Instagram doesn't support direct URL sharing, so we'll use native share
    // and suggest copying the link
    const instagramUrl = 'instagram://app';

    const supported = await Linking.canOpenURL(instagramUrl);
    if (supported) {
      // Copy URL to clipboard for user to paste in Instagram bio
      await Linking.openURL(instagramUrl);
      return;
    } else {
      throw new Error('Instagram not installed');
    }
  } catch (error) {
    throw new Error('Failed to share to Instagram: ' + (error as Error).message);
  }
}

/**
 * Share to Telegram
 */
export async function shareToTelegram(listing: Listing): Promise<void> {
  try {
    const { message, url } = generateShareContent(listing);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(telegramUrl);
    if (supported) {
      await Linking.openURL(telegramUrl);
    } else {
      throw new Error('Telegram not installed');
    }
  } catch (error) {
    throw new Error('Failed to share to Telegram: ' + (error as Error).message);
  }
}

/**
 * Copy listing link to clipboard (for manual sharing)
 */
export async function copyLinkToClipboard(listing: Listing): Promise<void> {
  try {
    const url = `https://www.landrushafrica.com/listings/${listing.id}`;

    // Use React Native's Share API which has clipboard support on some platforms
    await Share.share({
      message: url,
      title: listing.title,
    });
  } catch (error) {
    throw new Error('Failed to copy link: ' + (error as Error).message);
  }
}

/**
 * Native share (opens system share menu)
 */
export async function nativeShare(listing: Listing): Promise<void> {
  try {
    const { message, title, url } = generateShareContent(listing);

    await Share.share({
      message: Platform.OS === 'ios' ? message : message,
      url: Platform.OS === 'ios' ? url : undefined,
      title: title,
    });
  } catch (error) {
    if ((error as Error).message !== 'User did not share') {
      throw new Error('Share failed: ' + (error as Error).message);
    }
  }
}

/**
 * Get available share platforms
 */
export const SHARE_PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'logo-whatsapp',
    color: '#25D366',
    handler: shareToWhatsApp,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    handler: shareToFacebook,
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: 'logo-twitter',
    color: '#000000',
    handler: shareToTwitter,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'send-outline',
    color: '#0088cc',
    handler: shareToTelegram,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'logo-instagram',
    color: '#E4405F',
    handler: shareToInstagram,
  },
  {
    id: 'copy-link',
    name: 'Copy Link',
    icon: 'copy-outline',
    color: '#666666',
    handler: copyLinkToClipboard,
  },
];
