import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { TicketsStackParamList } from '../../navigation/TicketsNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { lightTheme } from '../../theme';
import { fetchTickets } from '../../store/slices/ticketsSlice';
import { formatDate } from '../../utils/formatters';
import { MessageSquare, Plus, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, Circle as XCircle } from 'lucide-react-native';

type Props = StackScreenProps<TicketsStackParamList, 'TicketsList'>;

const TicketsListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  
  const { tickets, isLoading } = useSelector((state: RootState) => state.tickets);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      await dispatch(fetchTickets());
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const filteredTickets = selectedStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === selectedStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle color={theme.colors.error} size={20} />;
      case 'in_progress':
        return <Clock color={theme.colors.warning} size={20} />;
      case 'resolved':
        return <CheckCircle color={theme.colors.success} size={20} />;
      case 'closed':
        return <XCircle color={theme.colors.onSurfaceVariant} size={20} />;
      default:
        return <MessageSquare color={theme.colors.onSurfaceVariant} size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return theme.colors.error;
      case 'in_progress':
        return theme.colors.warning;
      case 'resolved':
        return theme.colors.success;
      case 'closed':
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Support Tickets
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateTicket')}
          style={styles.addButton}
        >
          <Plus color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'closed', label: 'Closed' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedStatus === filter.key && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedStatus(filter.key as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: selectedStatus === filter.key ? '#FFFFFF' : theme.colors.onSurface },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        {filteredTickets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <MessageSquare color={theme.colors.onSurfaceVariant} size={48} />
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                No support tickets
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
                Create a ticket if you need help with anything
              </Text>
              <Button
                title="Create Ticket"
                onPress={() => navigation.navigate('CreateTicket')}
                style={styles.createButton}
              />
            </View>
          </Card>
        ) : (
          <View style={styles.ticketsList}>
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} style={styles.ticketCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TicketDetails', { ticketId: ticket.id })}
                >
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketInfo}>
                      <Text style={[styles.ticketTitle, { color: theme.colors.onSurface }]}>
                        {ticket.title}
                      </Text>
                      <Text style={[styles.ticketId, { color: theme.colors.onSurfaceVariant }]}>
                        #{ticket.id.slice(-6).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.ticketMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
                        <Text style={styles.priorityText}>
                          {ticket.priority.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={[styles.ticketDescription, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                    {ticket.description}
                  </Text>
                  
                  <View style={styles.ticketFooter}>
                    <View style={styles.ticketStatus}>
                      {getStatusIcon(ticket.status)}
                      <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.ticketDate, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(ticket.createdAt, 'short')}
                    </Text>
                  </View>
                  
                  {ticket.responses && ticket.responses.length > 0 && (
                    <View style={styles.responseIndicator}>
                      <MessageSquare color={theme.colors.primary} size={16} />
                      <Text style={[styles.responseCount, { color: theme.colors.primary }]}>
                        {ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
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
  title: {
    fontSize: lightTheme.typography.h2.fontSize,
    fontWeight: lightTheme.typography.h2.fontWeight,
  },
  addButton: {
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
    marginBottom: lightTheme.spacing.xl,
  },
  createButton: {
    minWidth: 200,
  },
  ticketsList: {
    gap: lightTheme.spacing.md,
  },
  ticketCard: {
    padding: lightTheme.spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: lightTheme.spacing.sm,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.xs,
  },
  ticketId: {
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '500',
  },
  ticketMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.sm,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    lineHeight: 20,
    marginBottom: lightTheme.spacing.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.xs,
  },
  statusText: {
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '500',
  },
  ticketDate: {
    fontSize: lightTheme.typography.caption.fontSize,
  },
  responseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.xs,
    marginTop: lightTheme.spacing.sm,
    paddingTop: lightTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
  },
  responseCount: {
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '500',
  },
});

export default TicketsListScreen;