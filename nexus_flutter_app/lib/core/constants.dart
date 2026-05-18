class ApiConstants {
  static const bool isProduction = true; // Toggle this for deployment

  // Use 10.0.2.2 for Android Emulator, localhost for iOS/Web, or your live URL
  static const String _localUrl = "http://10.51.226.81:5000/api";
  static const String _prodUrl = "https://health-app-ra0c.onrender.com";

  static String get baseUrl => isProduction ? _prodUrl : _localUrl;
  
  static String get login => "$baseUrl/auth/login";
  static String get register => "$baseUrl/auth/register";
  static String get refresh => "$baseUrl/auth/refresh";
  static String get me => "$baseUrl/auth/me";
  static String get predict => "$baseUrl/predict/";
  static String get history => "$baseUrl/history/";
  static String get feedback => "$baseUrl/admin/feedback";
  static String get stats => "$baseUrl/admin/stats";
}
