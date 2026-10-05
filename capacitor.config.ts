import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skygardenapps.mookworlds',
  appName: 'Mook Worlds',
  webDir: 'www',
  backgroundColor: '#65d6c5',
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
    scrollEnabled: false,
    limitsNavigationsToAppBoundDomains: true,
    scheme: 'MookWorlds'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: '#65d6c5',
      showSpinner: false
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK'
    }
  }
};

export default config;
