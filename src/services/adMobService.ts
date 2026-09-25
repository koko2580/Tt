import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  RewardInterstitialAdPluginEvents,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// AdMob Unit IDs configuration
export const ADMOB_IDS = {
  appId: 'ca-app-pub-5984576938417142~8737463815',
  banner: 'ca-app-pub-5984576938417142/2994020841',
  interstitial: 'ca-app-pub-5984576938417142/3117455560',
  rewarded: 'ca-app-pub-5984576938417142/5620184189',
  rewardedInterstitial: 'ca-app-pub-5984576938417142/8142567448',
};

// State trackers for smart preloading
let isAdmobInitialized = false;
let isInterstitialPrepared = false;
let isRewardedPrepared = false;

export const initAdMob = async () => {
  if (Capacitor.getPlatform() === 'web') return;
  if (isAdmobInitialized) return;

  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
    isAdmobInitialized = true;
    console.log('AdMob initialized successfully');

    // Preload ads in advance
    prepareInterstitial();
    prepareRewardedVideo();
  } catch (err) {
    console.error('Failed to initialize AdMob', err);
  }
};

export const showBanner = async () => {
  if (!isAdmobInitialized || Capacitor.getPlatform() === 'web') return;
  try {
    await AdMob.showBanner({
      adId: ADMOB_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false,
    });
  } catch (err) {
    console.error('Banner ad failed to load', err);
  }
};

export const hideBanner = async () => {
  if (!isAdmobInitialized) return;
  await AdMob.hideBanner().catch(console.error);
};

export const removeBanner = async () => {
  if (!isAdmobInitialized) return;
  await AdMob.removeBanner().catch(console.error);
};

// ----------------------------------------------------------------------
// Interstitial Ad Management (Standard for Video Download button clicks)
// ----------------------------------------------------------------------
export const prepareInterstitial = async () => {
  if (!isAdmobInitialized || Capacitor.getPlatform() === 'web') return;
  if (isInterstitialPrepared) return;

  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_IDS.interstitial,
      isTesting: false,
    });
    isInterstitialPrepared = true;
    console.log('Interstitial ad prepared');
  } catch (err) {
    console.warn('Failed to prepare interstitial', err);
    isInterstitialPrepared = false;
  }
};

export const showInterstitialAd = async (onDone: () => void, onFallback?: () => void) => {
  if (!isAdmobInitialized || Capacitor.getPlatform() === 'web') {
    onDone();
    return;
  }

  // If not prepared yet, try to show rewarded or fallback immediately
  if (!isInterstitialPrepared) {
    // Try rewarded if ready
    if (isRewardedPrepared) {
      showRewardedVideo(onDone, onFallback);
      return;
    }
    // Attempt fast prepare and trigger fallback so user isn't stuck
    prepareInterstitial();
    onFallback ? onFallback() : onDone();
    return;
  }

  let dismissed = false;
  let dismissListener: any;
  let failedListener: any;

  const cleanup = () => {
    if (dismissListener) dismissListener.remove();
    if (failedListener) failedListener.remove();
    isInterstitialPrepared = false;
    prepareInterstitial(); // Preload next ad
  };

  try {
    dismissListener = await AdMob.addListener(
      InterstitialAdPluginEvents.Dismissed,
      () => {
        if (!dismissed) {
          dismissed = true;
          cleanup();
          onDone();
        }
      }
    );

    failedListener = await AdMob.addListener(
      InterstitialAdPluginEvents.FailedToShow,
      () => {
        if (!dismissed) {
          dismissed = true;
          cleanup();
          onFallback ? onFallback() : onDone();
        }
      }
    );

    await AdMob.showInterstitial();
  } catch (err) {
    console.error('Error showing interstitial ad', err);
    cleanup();
    onFallback ? onFallback() : onDone();
  }
};

// ----------------------------------------------------------------------
// Rewarded Video Ad Management
// ----------------------------------------------------------------------
export const prepareRewardedVideo = async () => {
  if (!isAdmobInitialized || Capacitor.getPlatform() === 'web') return;
  if (isRewardedPrepared) return;

  try {
    await AdMob.prepareRewardVideoAd({
      adId: ADMOB_IDS.rewarded,
      isTesting: false,
    });
    isRewardedPrepared = true;
    console.log('Rewarded video prepared');
  } catch (err) {
    console.warn('Failed to prepare rewarded video', err);
    isRewardedPrepared = false;
  }
};

export const showRewardedVideo = async (onReward: () => void, onFallback?: () => void) => {
  if (!isAdmobInitialized || Capacitor.getPlatform() === 'web') {
    onReward();
    return;
  }

  if (!isRewardedPrepared) {
    prepareRewardedVideo();
    onFallback ? onFallback() : onReward();
    return;
  }

  let dismissed = false;
  let dismissListener: any;

  const cleanup = () => {
    if (dismissListener) dismissListener.remove();
    isRewardedPrepared = false;
    prepareRewardedVideo();
  };

  try {
    dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      if (!dismissed) {
        dismissed = true;
        cleanup();
        onReward();
      }
    });

    await AdMob.showRewardVideoAd();
  } catch (err) {
    console.error('Show rewarded failed', err);
    cleanup();
    onFallback ? onFallback() : onReward();
  }
};

/**
 * Universal Download Ad Trigger:
 * Attempts to display an interstitial ad or rewarded video ad before starting video download.
 */
export const triggerDownloadAd = async (onProceed: () => void) => {
  // On web platform, immediately proceed
  if (Capacitor.getPlatform() === 'web') {
    onProceed();
    return;
  }

  // Try showing Interstitial first (preferred for download click)
  showInterstitialAd(
    () => {
      onProceed();
    },
    () => {
      // Fallback
      onProceed();
    }
  );
};
