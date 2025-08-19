import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { EarningsStackParamList } from '../../navigation/EarningsNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { fetchWalletData, fetchTransactions } from '../../store/slices/earningsSlice';
import { formatCurrency, formatDate, calculateEarnings } from '../../utils/formatters';
import { Wallet, TrendingUp, Calendar, ArrowRight, DollarSign, Clock } from 'lucide-react-native';

type Props = StackScreenProps<EarningsStackParamList, 'Earnings'>;

const EarningsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { wallet, transactions, isLoading } = useSelector((state: RootState) => state.earnings);
  const { orderHistory } = useSelector((state: RootState) => state.orders);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    loadEarningsData();
  }, [selectedPeriod]);

  const loadEarningsData = async () => {
    try {
      await Promise.all([
        dispatch(fetchWalletData()),
        dispatch(fetchTransactions({ period: selectedPeriod })),
      ]);
    } catch (error) {
      console.error('Error loading earnings data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEarningsData();
    setRefreshing(false);
  };

  const earnings = calculateEarnings(orderHistory);

  const periodData = {
    daily: { label: 'Today', amount: earnings.today },
    weekly: { label: 'This Week', amount: earnings.week },
    monthly: { label: 'This Month', amount: earnings.month },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Earnings
        </Text>
      </View>

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
        {/* Wallet Balance */}
        <Card style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <Wallet color={theme.colors.primary} size={32} />
            <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
              <ArrowRight color={theme.colors.onSurfaceVariant} size={20} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.walletBalance, { color: theme.colors.onSurface }]}>
            {formatCurrency(wallet.balance)}
          </Text>
          <Text style={[styles.walletLabel, { color: theme.colors.onSurfaceVariant }]}>
            Available Balance
          </Text>
          <View style={styles.walletStats}>
            <View style={styles.walletStat}>
              <Text style={[styles.walletStatValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(wallet.pendingAmount)}
              </Text>
              <Text style={[styles.walletStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                Pending
              </Text>
            </View>
            <View style={styles.walletStat}>
              <Text style={[styles.walletStatValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(wallet.cashInHand)}
              </Text>
              <Text style={[styles.walletStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                Cash in Hand
              </Text>
            </View>
          </View>
        </Card>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === period ? '#FFFFFF' : theme.colors.onSurface },
                ]}
              >
                {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Earnings Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <TrendingUp color={theme.colors.success} size={24} />
            <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
              {periodData[selectedPeriod].label} Earnings
            </Text>
          </View>
          <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>
            {formatCurrency(periodData[selectedPeriod].amount)}
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <DollarSign color={theme.colors.primary} size={20} />
              <View>
                <Text style={[styles.summaryStatValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(wallet.totalEarnings)}
                </Text>
                <Text style={[styles.summaryStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Earnings
                </Text>
              </View>
            </View>
            <View style={styles.summaryStat}>
              <Clock color={theme.colors.accent} size={20} />
              <View>
                <Text style={[styles.summaryStatValue, { color: theme.colors.onSurface }]}>
                  {orderHistory.filter(o => o.status === 'delivered').length}
                </Text>
                <Text style={[styles.summaryStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Orders Completed
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <View style={styles.transactionsHeader}>
            <Text style={[styles.transactionsTitle, { color: theme.colors.onSurface }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Calendar color={theme.colors.onSurfaceVariant} size={32} />
              <Text style={[styles.emptyTransactionsText, { color: theme.colors.onSurfaceVariant }]}>
                No transactions yet
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionType, { color: theme.colors.onSurface }]}>
                      {transaction.type.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text style={[styles.transactionDate, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(transaction.date, 'time')}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[styles.transactionValue, { color: theme.colors.success }]}>
                      +{formatCurrency(transaction.amount)}
                    </Text>
                    <View style={[
                      styles.transactionStatus,
                      { backgroundColor: transaction.status === 'paid' ? theme.colors.success : theme.colors.warning }
                    ]}>
                      <Text style={styles.transactionStatusText}>
                        {transaction.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.actionsTitle, { color: theme.colors.onSurface }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Button
              title="View Wallet"
              onPress={() => navigation.navigate('Wallet')}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="All Transactions"
              onPress={() => navigation.navigate('Transactions')}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
  },
  title: {
    fontSize: lightTheme.typography.h2.fontSize,
    fontWeight: lightTheme.typography.h2.fontWeight,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  walletCard: {
    marginBottom: lightTheme.spacing.md,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: lightTheme.spacing.xs,
  },
  walletLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginBottom: lightTheme.spacing.lg,
  },
  walletStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletStat: {
    alignItems: 'center',
  },
  walletStatValue: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  walletStatLabel: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.surfaceVariant,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.xs,
    marginBottom: lightTheme.spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.sm,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  summaryCard: {
    marginBottom: lightTheme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.md,
  },
  summaryTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: lightTheme.spacing.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.sm,
  },
  summaryStatValue: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '600',
  },
  summaryStatLabel: {
    fontSize: lightTheme.typography.caption.fontSize,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  transactionsTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  viewAllText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xl,
  },
  emptyTransactionsText: {
    fontSize: lightTheme.typography.body.fontSize,
    marginTop: lightTheme.spacing.sm,
  },
  transactionsList: {
    gap: lightTheme.spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
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
  actionsCard: {
    marginBottom: lightTheme.spacing.lg,
  },
  actionsTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default EarningsScreen;