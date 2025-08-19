import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { EarningsStackParamList } from '../../navigation/EarningsNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { lightTheme } from '../../theme';
import { fetchWalletData, requestPayout } from '../../store/slices/earningsSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote } from 'lucide-react-native';

type Props = StackScreenProps<EarningsStackParamList, 'Wallet'>;

const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { wallet, isLoading } = useSelector((state: RootState) => state.earnings);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      await dispatch(fetchWalletData());
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount > wallet.balance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance');
      return;
    }

    if (amount < 100) {
      Alert.alert('Minimum Amount', 'Minimum withdrawal amount is ₹100');
      return;
    }

    setPayoutLoading(true);
    try {
      await dispatch(requestPayout(amount)).unwrap();
      setShowPayoutModal(false);
      setPayoutAmount('');
      Alert.alert('Success', 'Payout request submitted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Wallet
        </Text>
        <View style={styles.placeholder} />
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
        {/* Wallet Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet color={theme.colors.primary} size={32} />
            <Text style={[styles.balanceLabel, { color: theme.colors.onSurfaceVariant }]}>
              Available Balance
            </Text>
          </View>
          <Text style={[styles.balanceAmount, { color: theme.colors.onSurface }]}>
            {formatCurrency(wallet.balance)}
          </Text>
          <Button
            title="Withdraw Money"
            onPress={() => setShowPayoutModal(true)}
            style={styles.withdrawButton}
            disabled={wallet.balance < 100}
          />
        </Card>

        {/* Wallet Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <ArrowDownLeft color={theme.colors.warning} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(wallet.pendingAmount)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Pending Amount
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Banknote color={theme.colors.success} size={24} />
              <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(wallet.cashInHand)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Cash in Hand
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <Card style={styles.totalCard}>
          <View style={styles.totalContent}>
            <ArrowUpRight color={theme.colors.primary} size={24} />
            <View style={styles.totalInfo}>
              <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(wallet.totalEarnings)}
              </Text>
              <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Lifetime Earnings
              </Text>
            </View>
          </View>
        </Card>

        {/* Withdrawal Info */}
        <Card style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: theme.colors.onSurface }]}>
            Withdrawal Information
          </Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                • Minimum withdrawal amount: ₹100
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                • Processing time: 1-3 business days
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                • No withdrawal charges
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                • Money will be transferred to your registered bank account
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Payout Modal */}
      <Modal
        visible={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Withdraw Money
          </Text>
          <Text style={[styles.modalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Available Balance: {formatCurrency(wallet.balance)}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
              Enter Amount
            </Text>
            <TextInput
              style={[
                styles.amountInput,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.onSurface,
                },
              ]}
              value={payoutAmount}
              onChangeText={setPayoutAmount}
              placeholder="Enter amount to withdraw"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={() => setShowPayoutModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Withdraw"
              onPress={handleRequestPayout}
              loading={payoutLoading}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  balanceCard: {
    marginBottom: lightTheme.spacing.md,
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xl,
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.lg,
  },
  balanceLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.sm,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: lightTheme.spacing.xl,
  },
  withdrawButton: {
    minWidth: 200,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: lightTheme.spacing.md,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  statLabel: {
    fontSize: lightTheme.typography.caption.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  totalCard: {
    marginBottom: lightTheme.spacing.md,
  },
  totalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.md,
  },
  totalInfo: {
    flex: 1,
  },
  totalValue: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
  },
  totalLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  infoCard: {
    marginBottom: lightTheme.spacing.lg,
  },
  infoTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  infoList: {
    gap: lightTheme.spacing.sm,
  },
  infoItem: {},
  infoLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    lineHeight: 20,
  },
  modalContent: {
    padding: lightTheme.spacing.lg,
  },
  modalTitle: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
    marginBottom: lightTheme.spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: lightTheme.typography.body.fontSize,
    marginBottom: lightTheme.spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: lightTheme.spacing.xl,
  },
  inputLabel: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
    marginBottom: lightTheme.spacing.sm,
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    fontSize: lightTheme.typography.body.fontSize,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default WalletScreen;