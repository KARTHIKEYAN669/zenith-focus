import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:nexus_flutter_app/core/constants.dart';

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  String? _accessToken;
  final _storage = const FlutterSecureStorage();
  
  // Callback to trigger AuthProvider logout on 401
  void Function()? onUnauth;

  Future<void> init() async {
    _accessToken = await _storage.read(key: 'access_token');
  }

  Future<void> setTokens(String access, String refresh) async {
    _accessToken = access;
    await _storage.write(key: 'access_token', value: access);
    await _storage.write(key: 'refresh_token', value: refresh);
  }

  Future<void> clearTokens() async {
    _accessToken = null;
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
  }

  Map<String, String> _getHeaders() {
    return {
      'Content-Type': 'application/json',
      if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
    };
  }

  bool _isRefreshing = false;

  void _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return;
    }
    
    String message = "Something went wrong";
    try {
      final body = jsonDecode(response.body);
      if (body['message'] != null) {
        message = body['message'];
      }
    } catch (_) {}

    if (response.statusCode == 401) {
      throw ApiException(401, "Session expired.");
    } else if (response.statusCode == 429) {
      throw ApiException(429, "Too many requests. Please try again later.");
    } else if (response.statusCode == 400) {
      throw ApiException(400, message);
    } else if (response.statusCode >= 500) {
      throw ApiException(500, "Server error, try again.");
    } else {
      throw ApiException(response.statusCode, message);
    }
  }

  Future<bool> _refreshToken() async {
    final refreshToken = await _storage.read(key: 'refresh_token');
    if (refreshToken == null) return false;

    try {
      final response = await http.post(
        Uri.parse(ApiConstants.refresh),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $refreshToken'
        },
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'] ?? body;
        final newAccess = data['access_token'];
        if (newAccess != null) {
          _accessToken = newAccess;
          await _storage.write(key: 'access_token', value: newAccess);
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  Future<http.Response> get(String url, {bool isRetry = false}) async {
    final response = await http.get(Uri.parse(url), headers: _getHeaders());
    try {
      _handleResponse(response);
      return response;
    } on ApiException catch (e) {
      if (e.statusCode == 401 && !isRetry) {
        if (!_isRefreshing) {
          _isRefreshing = true;
          final success = await _refreshToken();
          _isRefreshing = false;
          if (success) {
            return await get(url, isRetry: true);
          } else {
            clearTokens();
            if (onUnauth != null) onUnauth!();
            throw ApiException(401, "Session expired. Please login again.");
          }
        }
      }
      throw e;
    }
  }

  Future<http.Response> post(String url, dynamic body, {bool isRetry = false}) async {
    final response = await http.post(
      Uri.parse(url),
      headers: _getHeaders(),
      body: jsonEncode(body),
    );
    try {
      _handleResponse(response);
      return response;
    } on ApiException catch (e) {
      if (e.statusCode == 401 && !isRetry) {
        if (!_isRefreshing) {
          _isRefreshing = true;
          final success = await _refreshToken();
          _isRefreshing = false;
          if (success) {
            return await post(url, body, isRetry: true);
          } else {
            clearTokens();
            if (onUnauth != null) onUnauth!();
            throw ApiException(401, "Session expired. Please login again.");
          }
        }
      }
      throw e;
    }
  }
}
