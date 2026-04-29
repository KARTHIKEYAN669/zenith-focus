import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:nexus_flutter_app/providers/auth_provider.dart';
import 'package:nexus_flutter_app/providers/history_provider.dart';
import 'package:nexus_flutter_app/screens/predictor_screen.dart';
import 'package:nexus_flutter_app/screens/history_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => 
      Provider.of<HistoryProvider>(context, listen: false).fetchHistory()
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final historyProvider = Provider.of<HistoryProvider>(context);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0A0E12), Color(0xFF161B22)],
          ),
        ),
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: () => historyProvider.fetchHistory(),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Welcome back,",
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    color: Colors.white70,
                                  ),
                                ),
                                Text(
                                  auth.username ?? "User",
                                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            IconButton(
                              onPressed: () => auth.logout(),
                              icon: const Icon(Icons.logout, color: Colors.white70),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        _buildStatusCard(context, historyProvider),
                        const SizedBox(height: 32),
                        Text(
                          "AI Insights",
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildInsightsList(historyProvider),
                        const SizedBox(height: 32),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildQuickAction(
                              context,
                              "Predict",
                              Icons.analytics_outlined,
                              const Color(0xFF6366F1),
                              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PredictorScreen())),
                            ),
                            _buildQuickAction(
                              context,
                              "History",
                              Icons.history,
                              const Color(0xFF10B981),
                              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HistoryScreen())),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context, HistoryProvider provider) {
    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final lastEntry = provider.history.isNotEmpty ? provider.history.last : null;
    final focusScore = lastEntry?['focus_score'] ?? 0;
    final burnoutScore = lastEntry?['burnout_score'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF161B22),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildScoreIndicator(context, "Focus", focusScore, const Color(0xFF6366F1)),
              Container(width: 1, height: 60, color: Colors.white12),
              _buildScoreIndicator(context, "Burnout", burnoutScore, const Color(0xFFEF4444)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildScoreIndicator(BuildContext context, String label, int score, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 16),
        ),
        const SizedBox(height: 8),
        Text(
          "$score%",
          style: TextStyle(
            color: color,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildInsightsList(HistoryProvider provider) {
    if (provider.insights.isEmpty) {
      return const Text("No insights available yet. Keep logging!");
    }

    return Column(
      children: provider.insights.map((insight) => _buildInsightItem(insight.toString())).toList(),
    );
  }

  Widget _buildInsightItem(String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Icon(Icons.auto_awesome, color: Color(0xFF6366F1), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, String label, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: MediaQuery.of(context).size.width * 0.4,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 12),
            Text(
              label,
              style: TextStyle(color: color, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
