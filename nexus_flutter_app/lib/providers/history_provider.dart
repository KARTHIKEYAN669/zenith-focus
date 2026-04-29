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
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _history = data['history'] ?? [];
        _insights = data['insights'] ?? [];
      }
    } catch (e) {
      print("Fetch history error: $e");
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> predictFocus(Map<String, dynamic> body) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.post(ApiConstants.predict, body);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await fetchHistory(); // Refresh history
        _isLoading = false;
        notifyListeners();
        return data;
      }
    } catch (e) {
      print("Predict focus error: $e");
    }

    _isLoading = false;
    notifyListeners();
    return null;
  }
}
