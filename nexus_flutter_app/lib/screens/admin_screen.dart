import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({Key? key}) : super(key: key);

  @override
  _AdminScreenState createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  Map<String, dynamic>? stats;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadStats();
  }

  Future<void> loadStats() async {
    try {
      final response = await http.get(Uri.parse('${ApiService.baseUrl}/admin/stats'));
      if (response.statusCode == 200) {
        setState(() {
          stats = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        setState(() => isLoading = false);
      }
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Center(child: CircularProgressIndicator());
    if (stats == null) return const Center(child: Text('Failed to load admin stats'));

    final feedback = stats!['feedback'] as List<dynamic>;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Platform Stats', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF00F0FF))),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _StatCard('Total Users', stats!['total_users'].toString(), Colors.blueAccent),
            _StatCard('Total Scores', stats!['total_scores'].toString(), Colors.pinkAccent),
          ],
        ),
        const SizedBox(height: 30),
        const Text('User Feedback', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        if (feedback.isEmpty) const Text('No feedback yet.', style: TextStyle(color: Colors.grey)),
        ...feedback.map((f) => Card(
          color: Colors.black26,
          child: ListTile(
            title: Text('${f['username']} [${f['category']}]', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(f['message']),
            trailing: Text(f['timestamp'].toString().split(' ')[0], style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ),
        )).toList()
      ],
    );
  }

  Widget _StatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: color)),
          Text(title, style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
