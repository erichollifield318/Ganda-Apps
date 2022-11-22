App.info({
  id: 'com.envent.ly',
  name: 'DoubleBay',
  description: 'DoubleBay',
  author: 'DeligenceTechnologies',
  email: 'amit@deligence.com',
  website: 'https://doublebay.envent.ly',
  version: '2.1.0'
});

// Set up resources such as icons and launch screens.
App.icons({
  "iphone_2x": "resources/icons/iphone_2x.png", // 120x120
  "iphone_3x": "resources/icons/iphone_3x.png", // 180x180
  "ipad": "resources/icons/ipad.png", // 76x76
  "ipad_2x": "resources/icons/ipad_2x.png", // 152x152
  "ipad_pro": "resources/icons/ipad_pro.png", // 167x167
  "ios_settings": "resources/icons/ios_settings.png", // 29x29
  "ios_settings_2x": "resources/icons/ios_settings_2x.png", // 58x58
  "ios_settings_3x": "resources/icons/ios_settings_3x.png", // 87x87
  "ios_spotlight": "resources/icons/ios_spotlight.png", // 40x40
  "ios_spotlight_2x": "resources/icons/ios_spotlight_2x.png", // 80x80
  "android_mdpi": "resources/icons/app_logo.png", // 48x48
  "android_hdpi": "resources/icons/app_logo.png", // 72x72
  "android_xhdpi": "resources/icons/app_logo.png", // 96x96
  "android_xxhdpi": "resources/icons/app_logo.png", // 144x144
  "android_xxxhdpi": "resources/icons/app_logo.png", // 192x192
  "iphone_legacy":"resources/icons/iphone-57pt-1x.png", // 57x57
  "iphone_legacy_2x":"resources/icons/iphone-57pt-2x.png", // 114x114
  "app_store":"resources/icons/Icon1024x1024.png", // 1024x1024
  "ipad_spotlight_legacy":"resources/icons/ipad-50pt-1x.png", // 50x50
  "ipad_spotlight_legacy_2x":"resources/icons/ipad-50pt-2x.png", // 100x100
  "ipad_app_legacy":"resources/icons/ipad-72pt-1x.png", // 72x72
  "ipad_app_legacy_2x":"resources/icons/ipad-72pt-2x.png", // 144x144
});

App.launchScreens({
  "iphone_2x": "resources/splashes/icon640x960.png", // 640x960
  "iphone5": "resources/splashes/iphone5.png", // 640x1136
  "iphone6": "resources/splashes/iphone6.png", // 750x1334
  "iphone6p_portrait": "resources/splashes/icon-1242-2208.png", // 1242x2208
  "iphone6p_landscape": "resources/splashes/iphone6p_landscape.png", // 2208x1242
  "ipad_portrait": "resources/splashes/ipad_portrait.png", // 768x1024
  "ipad_portrait_2x": "resources/splashes/ipad_portrait_2x.png", // 1536x2048
  "ipad_landscape": "resources/splashes/ipad_landscape.png", // 1024x768
  "ipad_landscape_2x": "resources/splashes/ipad_landscape_2x.png", // 2048x1536
  "android_mdpi_portrait": "resources/splashes/app_logo.png", // 320x480
  "android_mdpi_landscape": "resources/splashes/app_logo.png", // 480x320
  "android_hdpi_portrait": "resources/splashes/app_logo.png", // 480x800
  "android_hdpi_landscape": "resources/splashes/app_logo.png", // 800x480
  "android_xhdpi_portrait": "resources/splashes/app_logo.png", // 720x1280
  "android_xhdpi_landscape": "resources/splashes/app_logo.png", // 1280x720
  "android_xxhdpi_portrait": "resources/splashes/app_logo.png", // 1080x1440
  "android_xxhdpi_landscape": "resources/splashes/app_logo.png", // 1440x1080
  "iphone": "resources/splashes/icon-320X480.png", // 320x480
})

App.setPreference("WebAppStartupTimeout", 100000)
App.accessRule('*');
App.accessRule('http://*');
App.accessRule('https://*');
App.setPreference('android-minSdkVersion' , 26);
