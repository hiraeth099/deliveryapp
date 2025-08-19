import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { TicketsStackParamList } from '../../navigation/TicketsNavigator';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { updateTicket } from '../../store/slices/ticketsSlice';
import { formatDate } from '../../utils/formatters';
import { ArrowLeft, Send, Paperclip, User, Headphones, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, Circle as XCircle } from 'lucide-react-native';

type Props = StackScreenProps<TicketsStackParamList, 'TicketDetails'>;

const TicketDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;
  const { ticketId } = route.params;
  
  const { tickets } = useSelector((state: RootState) => state.tickets);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Ticket not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateTicket({ ticketId, message: newMessage.trim() })).unwrap();
      setNewMessage('');
      Alert.alert('Success', 'Message sent successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

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
        return <AlertCircle color={theme.colors.onSurfaceVariant} size={20} />;
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Ticket Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Ticket Info */}
        <Card style={styles.ticketInfoCard}>
          <View style={styles.ticketHeader}>
            <View style={styles.ticketTitleSection}>
              <Text style={[styles.ticketTitle, { color: theme.colors.onSurface }]}>
                {ticket.title}
              </Text>
              <Text style={[styles.ticketId, { color: theme.colors.onSurfaceVariant }]}>
                #{ticket.id.slice(-6).toUpperCase()}
              </Text>
            </View>
            <View style={styles.ticketBadges}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
                <Text style={styles.badgeText}>
                  {ticket.priority.toUpperCase()}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                <Text style={styles.badgeText}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.ticketDescription, { color: theme.colors.onSurfaceVariant }]}>
            {ticket.description}
          </Text>
          
          <View style={styles.ticketMeta}>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              Category: {ticket.category.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              Created: {formatDate(ticket.createdAt, 'long')}
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              Last Updated: {formatDate(ticket.updatedAt, 'long')}
            </Text>
          </View>

          {/* Ticket Images */}
          {ticket.images && ticket.images.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={[styles.imagesTitle, { color: theme.colors.onSurface }]}>
                Attachments
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imagesList}>
                  {ticket.images.map((image, index) => (
                    <TouchableOpacity key={index} style={styles.imageContainer}>
                      <Image source={{ uri: image }} style={styles.ticketImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </Card>

        {/* Conversation */}
        <Card style={styles.conversationCard}>
          <Text style={[styles.conversationTitle, { color: theme.colors.onSurface }]}>
            Conversation
          </Text>
          
          {ticket.responses && ticket.responses.length > 0 ? (
            <View style={styles.messagesList}>
              {ticket.responses.map((response) => (
                <View
                  key={response.id}
                  style={[
                    styles.messageContainer,
                    response.isAdmin ? styles.adminMessage : styles.userMessage,
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <View style={styles.messageAuthor}>
                      {response.isAdmin ? (
                        <Headphones color={theme.colors.primary} size={16} />
                      ) : (
                        <User color={theme.colors.onSurfaceVariant} size={16} />
                      )}
                      <Text style={[
                        styles.authorName,
                        { color: response.isAdmin ? theme.colors.primary : theme.colors.onSurface }
                      ]}>
                        {response.isAdmin ? 'Support Team' : user?.name || 'You'}
                      </Text>
                    </View>
                    <Text style={[styles.messageTime, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(response.timestamp, 'time')}
                    </Text>
                  </View>
                  <Text style={[styles.messageText, { color: theme.colors.onSurface }]}>
                    {response.message}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyConversation}>
              <Text style={[styles.emptyConversationText, { color: theme.colors.onSurfaceVariant }]}>
                No responses yet. Our support team will respond soon.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Message Input */}
      {ticket.status !== 'closed' && (
        <View style={[styles.messageInputContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.messageInput,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onSurface,
                },
              ]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.attachButton}>
              <Paperclip color={theme.colors.onSurfaceVariant} size={20} />
            </TouchableOpacity>
          </View>
          <Button
            title="Send"
            onPress={handleSendMessage}
            loading={loading}
            disabled={!newMessage.trim()}
            style={styles.sendButton}
            icon={<Send color="#FFFFFF" size={16} />}
          />
        </View>
      )}
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
  ticketInfoCard: {
    marginBottom: lightTheme.spacing.md,
  },
  ticketHeader: {
    marginBottom: lightTheme.spacing.md,
  },
  ticketTitleSection: {
    marginBottom: lightTheme.spacing.sm,
  },
  ticketTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.xs,
  },
  ticketId: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  ticketBadges: {
    flexDirection: 'row',
    gap: lightTheme.spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.sm,
  },
  statusBadge: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: lightTheme.typography.body.fontSize,
    lineHeight: 24,
    marginBottom: lightTheme.spacing.lg,
  },
  ticketMeta: {
    gap: lightTheme.spacing.xs,
  },
  metaText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
  imagesSection: {
    marginTop: lightTheme.spacing.lg,
  },
  imagesTitle: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '500',
    marginBottom: lightTheme.spacing.sm,
  },
  imagesList: {
    flexDirection: 'row',
    gap: lightTheme.spacing.sm,
  },
  imageContainer: {
    borderRadius: lightTheme.borderRadius.md,
    overflow: 'hidden',
  },
  ticketImage: {
    width: 80,
    height: 80,
    borderRadius: lightTheme.borderRadius.md,
  },
  conversationCard: {
    marginBottom: lightTheme.spacing.md,
  },
  conversationTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  messagesList: {
    gap: lightTheme.spacing.md,
  },
  messageContainer: {
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
  },
  adminMessage: {
    backgroundColor: lightTheme.colors.surfaceVariant,
    marginRight: lightTheme.spacing.xl,
  },
  userMessage: {
    backgroundColor: lightTheme.colors.primary + '10',
    marginLeft: lightTheme.spacing.xl,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  messageAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.xs,
  },
  authorName: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: lightTheme.typography.caption.fontSize,
  },
  messageText: {
    fontSize: lightTheme.typography.body.fontSize,
    lineHeight: 20,
  },
  emptyConversation: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xl,
  },
  emptyConversationText: {
    fontSize: lightTheme.typography.body.fontSize,
    textAlign: 'center',
  },
  messageInputContainer: {
    padding: lightTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.md,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    fontSize: lightTheme.typography.body.fontSize,
    maxHeight: 100,
  },
  attachButton: {
    padding: lightTheme.spacing.sm,
  },
  sendButton: {
    alignSelf: 'flex-end',
    minWidth: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: lightTheme.typography.body.fontSize,
  },
});

export default TicketDetailsScreen;