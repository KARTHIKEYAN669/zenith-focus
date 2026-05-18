import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:nexus_flutter_app/core/api_client.dart';
import 'package:nexus_flutter_app/core/constants.dart';

class HistoryProvider with ChangeNotifier {
  List<dynamic> _history = [];
  List<dynamic> _insights = [];
  bool _isLoading = false;

  List<dynamic> get history => _history;
  List<dynamic> get insights => _insights;
  bool get isLoading => _isLoading;

  final ApiClient _apiClient = ApiClient();

  Future<void> fetchHistory() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiConstants.history);
      final body = jsonDecode(response.body);
      final data = body['data'] ?? body;
      _history = data['history'] ?? [];
      _insights = data['insights'] ?? [];
    } on ApiException catch (e) {
      print("Fetch history api error: ${e.message}");
    } catch (e) {
      print("Fetch history error: $e");
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> predictFocus(Map<String, dynamic> reqBody) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post(ApiConstants.predict, reqBody);
      final body = jsonDecode(response.body);
      final data = body['data'] ?? body;
      await fetchHistory(); // Refresh history
      _isLoading = false;
      notifyListeners();
      return data;
    } on ApiException catch (e) {
      print("Predict focus api error: ${e.message}");
      // Re-throw so UI can catch it and show SnackBar
      _isLoading = false;
      notifyListeners();
      throw e;
    } catch (e) {
      print("Predict focus error: $e");
    }

    _isLoading = false;
    notifyListeners();
    return null;
  }
}
