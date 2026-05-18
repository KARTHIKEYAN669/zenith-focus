import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:nexus_flutter_app/core/api_client.dart';
import 'package:nexus_flutter_app/core/constants.dart';

class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  bool _isAdmin = false;
  String? _username;
  bool _isLoading = false;

  bool get isAuthenticated => _isAuthenticated;
  bool get isAdmin => _isAdmin;
  String? get username => _username;
  bool get isLoading => _isLoading;

  final ApiClient _apiClient = ApiClient();

  AuthProvider() {
    _apiClient.onUnauth = () {
      _isAuthenticated = false;
      _isAdmin = false;
      _username = null;
      notifyListeners();
    };
  }

  Future<String?> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.login,
        {'email': username, 'password': password},
      );

      print("LOGIN RESPONSE: ${response.body}");
      final body = jsonDecode(response.body);
      final data = body['data'];

      if (data == null) {
        throw ApiException(0, body['message'] ?? "Invalid response from server");
      }

      await _apiClient.setTokens(
        data['access_token'],
        data['refresh_token'] ?? '',
      );

      _isAuthenticated = true;
      _isAdmin = data['user']?['is_admin'] ?? false;
      _username = data['user']?['email'] ?? '';
      
      _isLoading = false;
      notifyListeners();
      return null; // Success
    } on ApiException catch (e) {
      _isLoading = false;
      notifyListeners();
      return e.message;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return "Login failed";
    }
  }

  Future<String?> register(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.register,
        {'email': username, 'password': password},
      );

      print("REGISTER RESPONSE: ${response.body}");
      final body = jsonDecode(response.body);
      final data = body['data'];

      if (data == null) {
        throw ApiException(0, body['message'] ?? "Invalid response from server");
      }

      await _apiClient.setTokens(
        data['access_token'],
        data['refresh_token'] ?? '',
      );

      _isAuthenticated = true;
      _isAdmin = data['user']?['is_admin'] ?? false;
      _username = data['user']?['email'] ?? '';

      _isLoading = false;
      notifyListeners();
      return null;
    } on ApiException catch (e) {
      _isLoading = false;
      notifyListeners();
      return e.message;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return "Registration failed";
    }
  }

  Future<void> logout() async {
    await _apiClient.clearTokens();
    _isAuthenticated = false;
    _isAdmin = false;
    _username = null;
    notifyListeners();
  }

  Future<void> checkAuthStatus() async {
    await _apiClient.init();
    try {
      final response = await _apiClient.get(ApiConstants.me);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        if (data != null && data['user'] != null) {
          _isAuthenticated = data['user']['logged_in'] ?? false;
          _username = data['user']['email'];
          _isAdmin = data['user']['is_admin'] ?? false;
        } else {
          _isAuthenticated = false;
        }
      } else {
        _isAuthenticated = false;
      }
    } catch (e) {
      _isAuthenticated = false;
    }
    notifyListeners();
  }
}
