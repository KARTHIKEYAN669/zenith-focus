class ApiConstants {
  static const String baseUrl = "http://10.0.2.2:5000/api"; // For Android Emulator
  // static const String baseUrl = "http://localhost:5000/api"; // For Web/iOS
  
  static const String login = "$baseUrl/auth/login";
  static const String register = "$baseUrl/auth/register";
  static const String refresh = "$baseUrl/auth/refresh";
  static const String me = "$baseUrl/auth/me";
  static const String predict = "$baseUrl/predict/";
  static const String history = "$baseUrl/history/";
  static const String feedback = "$baseUrl/admin/feedback";
  static const String stats = "$baseUrl/admin/stats";
}
