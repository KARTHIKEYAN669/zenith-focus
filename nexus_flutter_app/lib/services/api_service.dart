import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use 10.0.2.2 for Android emulator to access PC localhost
  // If running on a physical device, this needs to be your PC's local IP address
  static const String baseUrl = 'http://10.0.2.2:5000/api';
  
  // Simulated session storage for MVP
  static String? currentUsername;
  static bool isAdmin = false;

  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      currentUsername = data['username'];
      isAdmin = data['is_admin'] == 1 || data['is_admin'] == true;
    }
    return data;
  }

  static Future<Map<String, dynamic>> register(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      currentUsername = data['username'];
      isAdmin = data['is_admin'] == 1 || data['is_admin'] == true;
    }
    return data;
  }

  static Future<Map<String, dynamic>> predict(Map<String, dynamic> payload) async {
    final response = await http.post(
      Uri.parse('$baseUrl/predict'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> getHistory() async {
    final response = await http.get(Uri.parse('$baseUrl/history'));
    return jsonDecode(response.body);
  }
}
