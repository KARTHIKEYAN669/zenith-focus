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

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.login,
        {'username': username, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _apiClient.setTokens(data['access_token'], data['refresh_token']);
        _isAuthenticated = true;
        _isAdmin = data['is_admin'] ?? false;
        _username = data['username'];
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print("Login error: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.register,
        {'username': username, 'password': password},
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        await _apiClient.setTokens(data['access_token'], data['refresh_token']);
        _isAuthenticated = true;
        _isAdmin = data['is_admin'] ?? false;
        _username = data['username'];
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print("Register error: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
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
        final data = jsonDecode(response.body);
        _isAuthenticated = data['logged_in'];
        _username = data['username'];
        _isAdmin = data['is_admin'] ?? false;
      } else {
        _isAuthenticated = false;
      }
    } catch (e) {
      _isAuthenticated = false;
    }
    notifyListeners();
  }
}
