import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:nexus_flutter_app/providers/history_provider.dart';

class PredictorScreen extends StatefulWidget {
  const PredictorScreen({super.key});

  @override
  State<PredictorScreen> createState() => _PredictorScreenState();
}

class _PredictorScreenState extends State<PredictorScreen> {
  double _sleep = 7.0;
  double _study = 4.0;
  double _screen = 3.0;
  double _breaks = 2.0;
  String _mood = 'Good';

  void _submit() async {
    final history = Provider.of<HistoryProvider>(context, listen: false);
    try {
      final result = await history.predictFocus({
        'sleep': _sleep,
        'study': _study,
        'screen_time': _screen,
        'breaks': _breaks,
        'mood': _mood.toLowerCase(),
      });

      if (result != null && mounted) {
        _showResultDialog(result);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  void _showResultDialog(Map<String, dynamic> result) {
    Color statusColor = Colors.green;
    String status = result['status'].toString().toLowerCase();
    if (status.contains('poor') || status.contains('weak') || status.contains('high')) statusColor = Colors.redAccent;
    if (status.contains('moderate') || status.contains('average')) statusColor = Colors.orangeAccent;

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF161B22),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      const Text("Focus Score", style: TextStyle(color: Colors.white70)),
                      Text(
                        "${result['focus_score']}%",
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF6366F1)),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      const Text("Burnout Score", style: TextStyle(color: Colors.white70)),
                      Text(
                        "${result['burnout_score'] ?? 0}%",
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFFEF4444)),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor.withOpacity(0.5)),
                ),
                child: Text(
                  "Status: ${result['status']}",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: statusColor),
                ),
              ),
              const SizedBox(height: 24),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text("AI Recommendations:", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              const SizedBox(height: 8),
              ...((result['tips'] as List? ?? []).map((tip) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(tip.toString(), style: const TextStyle(fontSize: 14))),
                  ],
                ),
              )).toList()),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("Got it"),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final history = Provider.of<HistoryProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Focus Predictor"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            _buildSlider("Sleep (hours)", _sleep, 0, 12, (val) => setState(() => _sleep = val)),
            _buildSlider("Study (hours)", _study, 0, 16, (val) => setState(() => _study = val)),
            _buildSlider("Screen Time (hours)", _screen, 0, 16, (val) => setState(() => _screen = val)),
            _buildSlider("Breaks", _breaks, 0, 10, (val) => setState(() => _breaks = val)),
            const SizedBox(height: 24),
            DropdownButtonFormField<String>(
              value: _mood,
              decoration: const InputDecoration(labelText: "Current Mood"),
              items: ['Stressed', 'Sad', 'Good', 'Happy'].map((mood) => DropdownMenuItem(
                value: mood,
                child: Text(mood),
              )).toList(),
              onChanged: (val) => setState(() => _mood = val!),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: history.isLoading ? null : _submit,
                child: history.isLoading 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text("Analyze Focus"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(String label, double value, double min, double max, Function(double) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: Colors.white70)),
            Text(value.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1))),
          ],
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          divisions: (max - min).toInt() * 2,
          activeColor: const Color(0xFF6366F1),
          onChanged: onChanged,
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}
