import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { EarningsStackParamList } from '../../navigation/EarningsNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { lightTheme } from '../../theme';
import { fetchTransactions } from '../../store/slices/earningsSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, Filter, Calendar, DollarSign, TrendingUp } from 'lucide-react-native';

type Props = StackScreenProps<EarningsStackParamList, 'Transactions'>;

const TransactionsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { transactions, isLoading } = useSelector((state: RootState) => state.earnings);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'delivery_fee' | 'tip' | 'bonus'>('all');

  useEffect(() => {
    loadTransactions();
  }, [selectedFilter]);

  const loadTransactions = async () => {
    try {
      await dispatch(fetchTransactions());
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = selectedFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === selectedFilter);

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'delivery_fee':
        return <DollarSign color={theme.colors.primary} size={20} />;
      case 'tip':
        return <TrendingUp color={theme.colors.success} size={20} />;
      case 'bonus':
        return <TrendingUp color={theme.colors.accent} size={20} />;
      default:
        return <DollarSign color={theme.colors.onSurfaceVariant} size={20} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'delivery_fee':
        return theme.colors.primary;
      case 'tip':
        return theme.colors.success;
      case 'bonus':
        return theme.colors.accent;
      case 'penalty':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Transactions
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color={theme.colors.onSurfaceVariant} size={20} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'delivery_fee', label: 'Delivery Fee' },
          { key: 'tip', label: 'Tips' },
          { key: 'bonus', label: 'Bonus' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: selectedFilter === filter.key ? '#FFFFFF' : theme.colors.onSurface },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
              Total {selectedFilter === 'all' ? 'Earnings' : selectedFilter.replace('_', ' ')}
            </Text>
            <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <View style={styles.summaryStats}>
            <Text style={[styles.summaryCount, { color: theme.colors.onSurfaceVariant }]}>
              {filteredTransactions.length} transactions
            </Text>
          </View>
        </View>
      </Card>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {filteredTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Calendar color={theme.colors.onSurfaceVariant} size={48} />
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                No transactions found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
                Your transaction history will appear here
              </Text>
            </View>
          </Card>
        ) : (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIcon}>
                      {getTransactionIcon(transaction.type)}
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionType, { color: theme.colors.onSurface }]}>
                        {transaction.type.replace('_', ' ').toUpperCase()}
                      </Text>
                      <Text style={[styles.transactionOrderId, { color: theme.colors.onSurfaceVariant }]}>
                        Order #{transaction.orderId.slice(-6)}
                      </Text>
                      <Text style={[styles.transactionDate, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDate(transaction.date, 'long')} • {formatDate(transaction.date, 'time')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'penalty' ? theme.colors.error : theme.colors.success }
                    ]}>
                      {transaction.type === 'penalty' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </Text>
                    <View style={[
                      styles.transactionStatus,
                      { 
                        backgroundColor: transaction.status === 'paid' 
                          ? theme.colors.success 
                          : theme.colors.warning 
                      }
                    ]}>
                      <Text style={styles.transactionStatusText}>
                        {transaction.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.transactionMethod, { color: theme.colors.onSurfaceVariant }]}>
                      {transaction.paymentMethod.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
  },
  backButton: {
    padding: lightTheme.spacing.sm,
  },
  title: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
  },
  filterButton: {
    padding: lightTheme.spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: lightTheme.spacing.lg,
    marginBottom: lightTheme.spacing.md,
  },
  filterTab: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.full,
    marginRight: lightTheme.spacing.sm,
    backgroundColor: lightTheme.colors.surfaceVariant,
  },
  filterTabText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  summaryCard: {
    marginHorizontal: lightTheme.spacing.lg,
    marginBottom: lightTheme.spacing.md,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginBottom: lightTheme.spacing.xs,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryStats: {
    alignItems: 'flex-end',
  },
  summaryCount: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  emptyCard: {
    marginTop: lightTheme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
    marginTop: lightTheme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
    textAlign: 'center',
  },
  transactionsList: {
    gap: lightTheme.spacing.sm,
  },
  transactionCard: {
    padding: lightTheme.spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: lightTheme.borderRadius.full,
    backgroundColor: lightTheme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: lightTheme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
  },
  transactionOrderId: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  transactionDate: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '600',
  },
  transactionStatus: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.sm,
    marginTop: lightTheme.spacing.xs,
  },
  transactionStatusText: {
    color: '#FFFFFF',
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '600',
  },
  transactionMethod: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
});

export default TransactionsScreen;