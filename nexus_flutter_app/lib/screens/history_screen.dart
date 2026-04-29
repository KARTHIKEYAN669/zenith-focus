import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:nexus_flutter_app/providers/history_provider.dart';
import 'package:fl_chart/fl_chart.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final historyProvider = Provider.of<HistoryProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Your Progress"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: historyProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  if (historyProvider.history.isNotEmpty) ...[
                    const Text("Focus Trend", style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 200,
                      child: LineChart(
                        LineChartData(
                          gridData: FlGridData(show: false),
                          titlesData: FlTitlesData(show: false),
                          borderData: FlBorderData(show: false),
                          lineBarsData: [
                            LineChartBarData(
                              spots: historyProvider.history.asMap().entries.map((e) {
                                return FlSpot(e.key.toDouble(), (e.value['focus_score'] as num).toDouble());
                              }).toList(),
                              isCurved: true,
                              color: const Color(0xFF6366F1),
                              barWidth: 4,
                              isStrokeCapRound: true,
                              dotData: FlDotData(show: false),
                              belowBarData: BarAreaData(
                                show: true,
                                color: const Color(0xFF6366F1).withOpacity(0.1),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                  Expanded(
                    child: ListView.builder(
                      itemCount: historyProvider.history.length,
                      itemBuilder: (context, index) {
                        final entry = historyProvider.history[historyProvider.history.length - 1 - index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF161B22),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    entry['timestamp'].toString().split(' ')[0],
                                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    "Mood: ${entry['mood']}",
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              Text(
                                "${entry['focus_score']}%",
                                style: const TextStyle(
                                  color: Color(0xFF6366F1),
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
