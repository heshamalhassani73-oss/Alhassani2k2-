/**
 * Dashboard Screen - شاشة لوحة التحكم
 * Main dashboard with statistics and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAllTransactions, getStatistics } from '../services/DatabaseService';
import { TransactionStatus, getStatusName, getStatusColor } from '../models/Transaction';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const stats = await getStatistics();
      const transactions = await getAllTransactions({ limit: 5 });
      
      setStatistics(stats);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon, color }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={() => navigation.navigate('Transactions', { filter: title })}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStatusPieChart = () => {
    if (!statistics || !statistics.byStatus) return null;

    const chartData = Object.entries(statistics.byStatus).map(([status, count]) => ({
      name: getStatusName(status),
      count,
      color: getStatusColor(status),
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    if (chartData.length === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>توزيع الحالات</Text>
        <PieChart
          data={chartData}
          width={width - 60}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderPriorityBarChart = () => {
    if (!statistics || !statistics.byPriority) return null;

    const priorityNames = {
      normal: 'عادي',
      urgent: 'عاجل',
      very_urgent: 'عاجل جداً'
    };

    const priorityColors = {
      normal: '#95a5a6',
      urgent: '#f39c12',
      very_urgent: '#e74c3c'
    };

    const chartData = {
      labels: Object.keys(statistics.byPriority).map(k => priorityNames[k]),
      datasets: [{
        data: Object.values(statistics.byPriority),
        colors: Object.keys(statistics.byPriority).map(k => () => priorityColors[k])
      }]
    };

    if (chartData.datasets[0].data.every(v => v === 0)) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>الأولويات</Text>
        <BarChart
          data={chartData}
          width={width - 60}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          showBarTops={false}
          showValuesOnTopOfBars
        />
      </View>
    );
  };

  const QuickAction = ({ icon, title, onPress, color }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة التحكم</Text>
        <Text style={styles.headerSubtitle}>نظام وارد 3.0 لإدارة المعاملات</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <StatCard
          title="إجمالي المعاملات"
          value={statistics?.total || 0}
          icon="folder"
          color="#3498db"
        />
        <StatCard
          title="قيد التنفيذ"
          value={(statistics?.byStatus?.active || 0) + (statistics?.byStatus?.directed || 0)}
          icon="pending_actions"
          color="#2ecc71"
        />
        <StatCard
          title="متأخرة"
          value={statistics?.delayed || 0}
          icon="warning"
          color="#e74c3c"
        />
        <StatCard
          title="عاجلة"
          value={statistics?.urgent || 0}
          icon="priority_high"
          color="#f39c12"
        />
      </View>

      {/* Charts */}
      <View style={styles.chartsSection}>
        {renderStatusPieChart()}
        {renderPriorityBarChart()}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon="add_circle_outline"
            title="معاملة جديدة"
            onPress={() => navigation.navigate('NewTransaction')}
            color="#3498db"
          />
          <QuickAction
            icon="search"
            title="بحث"
            onPress={() => navigation.navigate('Search')}
            color="#9b59b6"
          />
          <QuickAction
            icon="notifications"
            title="الإشعارات"
            onPress={() => navigation.navigate('Notifications')}
            color="#e67e22"
          />
          <QuickAction
            icon="delete"
            title="المحذوفات"
            onPress={() => navigation.navigate('Trash')}
            color="#e74c3c"
          />
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>آخر المعاملات</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllLink}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد معاملات حديثة</Text>
          </View>
        ) : (
          recentTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => navigation.navigate('TransactionDetails', { id: transaction.id })}
            >
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(transaction.status) }
              ]} />
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionSubject} numberOfLines={1}>
                  {transaction.subject}
                </Text>
                <Text style={styles.transactionReference} numberOfLines={1}>
                  #{transaction.referenceNumber}
                </Text>
              </View>
              <View style={styles.transactionMeta}>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.dateReceived).toLocaleDateString('ar-SA')}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(transaction.status) + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(transaction.status) }
                  ]}>
                    {getStatusName(transaction.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  chartsSection: {
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  seeAllLink: {
    fontSize: 14,
    color: '#3498db',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '23%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 11,
    color: '#2c3e50',
    textAlign: 'center',
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  transactionReference: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  transactionMeta: {
    alignItems: 'flex-end',
  },
  transactionDate: {
    fontSize: 11,
    color: '#95a5a6',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 12,
  },
});

export default DashboardScreen;
