export default ({ config }) => ({
  ...config,

  plugins: [
    ...(config.plugins || []),
    ["react-native-maps", {
      androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
    }],

    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow PlotBy to use your location when selecting a property.",
      },
    ],
  ],
});