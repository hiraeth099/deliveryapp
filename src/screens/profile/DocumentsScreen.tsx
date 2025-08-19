import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { lightTheme } from '../../theme';
import { ArrowLeft, FileText, Upload, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Camera } from 'lucide-react-native';

type Props = StackScreenProps<ProfileStackParamList, 'Documents'>;

interface Document {
  id: string;
  type: 'driving_license' | 'vehicle_rc' | 'insurance' | 'aadhar' | 'pan';
  name: string;
  description: string;
  status: 'pending' | 'verified' | 'rejected' | 'not_uploaded';
  imageUrl?: string;
  rejectionReason?: string;
}

const DocumentsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = lightTheme;
  
  // Mock documents data - TODO: integrate backend call here
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      type: 'driving_license',
      name: 'Driving License',
      description: 'Valid driving license for your vehicle type',
      status: 'verified',
      imageUrl: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      type: 'vehicle_rc',
      name: 'Vehicle RC',
      description: 'Registration certificate of your vehicle',
      status: 'pending',
      imageUrl: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      type: 'insurance',
      name: 'Vehicle Insurance',
      description: 'Valid insurance policy for your vehicle',
      status: 'rejected',
      rejectionReason: 'Document is not clear. Please upload a clearer image.',
    },
    {
      id: '4',
      type: 'aadhar',
      name: 'Aadhar Card',
      description: 'Government issued identity proof',
      status: 'not_uploaded',
    },
    {
      id: '5',
      type: 'pan',
      name: 'PAN Card',
      description: 'Permanent Account Number card',
      status: 'not_uploaded',
    },
  ]);

  const handleUploadDocument = (documentId: string) => {
    // TODO: integrate backend call here - implement image picker and upload
    Alert.alert(
      'Upload Document',
      'Choose upload method',
      [
        { text: 'Camera', onPress: () => uploadFromCamera(documentId) },
        { text: 'Gallery', onPress: () => uploadFromGallery(documentId) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadFromCamera = (documentId: string) => {
    // TODO: integrate backend call here - implement camera capture
    console.log('Upload from camera for document:', documentId);
    Alert.alert('Info', 'Camera upload functionality will be implemented');
  };

  const uploadFromGallery = (documentId: string) => {
    // TODO: integrate backend call here - implement gallery picker
    console.log('Upload from gallery for document:', documentId);
    Alert.alert('Info', 'Gallery upload functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle color={theme.colors.success} size={20} />;
      case 'pending':
        return <AlertCircle color={theme.colors.warning} size={20} />;
      case 'rejected':
        return <AlertCircle color={theme.colors.error} size={20} />;
      default:
        return <Upload color={theme.colors.onSurfaceVariant} size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Uploaded';
    }
  };

  const verifiedCount = documents.filter(doc => doc.status === 'verified').length;
  const totalCount = documents.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.onBackground} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Documents
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <FileText color={theme.colors.primary} size={32} />
            <View style={styles.progressInfo}>
              <Text style={[styles.progressTitle, { color: theme.colors.onSurface }]}>
                Document Verification
              </Text>
              <Text style={[styles.progressSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {verifiedCount} of {totalCount} documents verified
              </Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(verifiedCount / totalCount) * 100}%`,
                  backgroundColor: theme.colors.success 
                }
              ]} 
            />
          </View>
          
          <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
            Complete document verification to start receiving orders
          </Text>
        </Card>

        {/* Documents List */}
        <View style={styles.documentsList}>
          {documents.map((document) => (
            <Card key={document.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentName, { color: theme.colors.onSurface }]}>
                    {document.name}
                  </Text>
                  <Text style={[styles.documentDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {document.description}
                  </Text>
                </View>
                <View style={styles.documentStatus}>
                  {getStatusIcon(document.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(document.status) }]}>
                    {getStatusText(document.status)}
                  </Text>
                </View>
              </View>

              {document.imageUrl && (
                <View style={styles.documentImageContainer}>
                  <Image source={{ uri: document.imageUrl }} style={styles.documentImage} />
                </View>
              )}

              {document.status === 'rejected' && document.rejectionReason && (
                <View style={styles.rejectionContainer}>
                  <Text style={[styles.rejectionTitle, { color: theme.colors.error }]}>
                    Rejection Reason:
                  </Text>
                  <Text style={[styles.rejectionReason, { color: theme.colors.onSurfaceVariant }]}>
                    {document.rejectionReason}
                  </Text>
                </View>
              )}

              <View style={styles.documentActions}>
                {document.status === 'not_uploaded' || document.status === 'rejected' ? (
                  <Button
                    title={document.status === 'rejected' ? 'Re-upload' : 'Upload'}
                    onPress={() => handleUploadDocument(document.id)}
                    style={styles.uploadButton}
                    icon={<Camera color="#FFFFFF" size={16} />}
                  />
                ) : document.status === 'verified' ? (
                  <Button
                    title="Update"
                    onPress={() => handleUploadDocument(document.id)}
                    variant="outline"
                    style={styles.updateButton}
                  />
                ) : (
                  <View style={styles.pendingContainer}>
                    <Text style={[styles.pendingText, { color: theme.colors.warning }]}>
                      Document is under review
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Text style={[styles.helpTitle, { color: theme.colors.onSurface }]}>
            Document Guidelines
          </Text>
          <View style={styles.helpList}>
            <Text style={[styles.helpItem, { color: theme.colors.onSurfaceVariant }]}>
              • Ensure documents are clear and readable
            </Text>
            <Text style={[styles.helpItem, { color: theme.colors.onSurfaceVariant }]}>
              • Upload original documents only
            </Text>
            <Text style={[styles.helpItem, { color: theme.colors.onSurfaceVariant }]}>
              • Documents should be valid and not expired
            </Text>
            <Text style={[styles.helpItem, { color: theme.colors.onSurfaceVariant }]}>
              • File size should be less than 5MB
            </Text>
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
  progressCard: {
    marginBottom: lightTheme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.lg,
  },
  progressInfo: {
    flex: 1,
    marginLeft: lightTheme.spacing.md,
  },
  progressTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
  },
  progressSubtitle: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    marginTop: lightTheme.spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: lightTheme.colors.surfaceVariant,
    borderRadius: lightTheme.borderRadius.full,
    marginBottom: lightTheme.spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: lightTheme.borderRadius.full,
  },
  progressText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    textAlign: 'center',
  },
  documentsList: {
    gap: lightTheme.spacing.md,
  },
  documentCard: {
    padding: lightTheme.spacing.md,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: lightTheme.spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: lightTheme.typography.body.fontSize,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.xs,
  },
  documentDescription: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    lineHeight: 18,
  },
  documentStatus: {
    alignItems: 'center',
    gap: lightTheme.spacing.xs,
  },
  statusText: {
    fontSize: lightTheme.typography.caption.fontSize,
    fontWeight: '500',
  },
  documentImageContainer: {
    marginBottom: lightTheme.spacing.md,
  },
  documentImage: {
    width: '100%',
    height: 120,
    borderRadius: lightTheme.borderRadius.md,
    resizeMode: 'cover',
  },
  rejectionContainer: {
    backgroundColor: lightTheme.colors.error + '10',
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    marginBottom: lightTheme.spacing.md,
  },
  rejectionTitle: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.xs,
  },
  rejectionReason: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    lineHeight: 18,
  },
  documentActions: {
    alignItems: 'center',
  },
  uploadButton: {
    minWidth: 120,
  },
  updateButton: {
    minWidth: 120,
  },
  pendingContainer: {
    paddingVertical: lightTheme.spacing.sm,
  },
  pendingText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  helpCard: {
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.xl,
  },
  helpTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    marginBottom: lightTheme.spacing.md,
  },
  helpList: {
    gap: lightTheme.spacing.sm,
  },
  helpItem: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    lineHeight: 20,
  },
});

export default DocumentsScreen;