import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme, useAppDispatch } from '../hooks';
import { createLeadAsync } from '../redux/slices/leadsSlice';
import { NotificationService } from '../services/notificationService';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DESTINATIONS, LEAD_SOURCES, TRAVEL_PACKAGES } from '../constants';
import { TravelDestination, LeadSource } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

interface AddLeadScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'AddLead'>;
}

export const AddLeadScreen: React.FC<AddLeadScreenProps> = ({ navigation }) => {
  const { colors, typography, borderRadius } = useTheme();
  const dispatch = useAppDispatch();

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState<TravelDestination>('Dubai');
  const [travelPackage, setTravelPackage] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [budget, setBudget] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-set travel package when destination changes
  React.useEffect(() => {
    const packages = TRAVEL_PACKAGES[destination];
    if (packages && packages.length > 0) {
      setTravelPackage(packages[0]);
    }
  }, [destination]);

  const validateEmail = (emailStr: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(emailStr);
  };

  const handleSave = () => {
    // Basic Form Validations
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone Number is required.');
      return;
    }
    if (phone.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid phone number (at least 10 digits).');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email Address is required.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!travelDate.trim()) {
      Alert.alert('Validation Error', 'Travel Date is required.');
      return;
    }
    // Simple date pattern validation YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(travelDate)) {
      Alert.alert('Validation Error', 'Please enter Travel Date in YYYY-MM-DD format.');
      return;
    }
    if (!budget.trim() || isNaN(Number(budget)) || Number(budget) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid budget amount (greater than 0).');
      return;
    }

    setLoading(true);
    dispatch(createLeadAsync({
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      destination,
      travelPackage,
      leadSource: source,
      assignedExecutive: 'Unassigned',
      leadStatus: 'New',
      budget: Number(budget),
      travelDate: travelDate.trim(),
      notes: notes.trim(),
    }))
      .unwrap()
      .then(() => {
        setLoading(false);
        // Instant on-device notification (works in foreground without FCM)
        NotificationService.presentLocalNotification(
          'New Lead Added! ✈️',
          `${fullName.trim()} — ${destination}`,
          { type: 'new_lead' }
        );
        Alert.alert('Success', 'Lead added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert('Error', err || 'Failed to create lead.');
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          Create New Lead
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          {/* Customer Info Section */}
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>Customer Information</Text>

          {/* Full Name */}
          <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}>
            <MaterialCommunityIcons name="account-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor={colors.placeholder}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Phone Number */}
          <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}>
            <MaterialCommunityIcons name="phone-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. +91 9876543210"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Email Address */}
          <Text style={[styles.label, { color: colors.text }]}>Email Address *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. ramesh.k@example.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Travel Interest Section */}
          <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 16 }]}>Travel Interest</Text>

          {/* Destination Selection */}
          <Text style={[styles.label, { color: colors.text }]}>Destination</Text>
          <View style={styles.chipGroup}>
            {DESTINATIONS.map((dest) => (
              <TouchableOpacity
                key={dest}
                style={[
                  styles.chip,
                  {
                    backgroundColor: destination === dest ? colors.primaryLight : colors.surface,
                    borderColor: destination === dest ? colors.primary : colors.border,
                    borderRadius: borderRadius.round
                  },
                ]}
                onPress={() => setDestination(dest)}
              >
                <Text style={{ color: destination === dest ? colors.primary : colors.text, fontSize: 12, fontWeight: '500' }}>
                  {dest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Travel Package */}
          <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Travel Package</Text>
          <View style={styles.chipGroup}>
            {TRAVEL_PACKAGES[destination]?.map((pkg) => (
              <TouchableOpacity
                key={pkg}
                style={[
                  styles.packageChip,
                  {
                    backgroundColor: travelPackage === pkg ? colors.primaryLight : colors.surface,
                    borderColor: travelPackage === pkg ? colors.primary : colors.border,
                    borderRadius: borderRadius.sm
                  },
                ]}
                onPress={() => setTravelPackage(pkg)}
              >
                <Text style={{ color: travelPackage === pkg ? colors.primary : colors.text, fontSize: 11, fontWeight: '500', textAlign: 'center' }}>
                  {pkg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Travel Date */}
          <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Travel Date (YYYY-MM-DD) *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}>
            <MaterialCommunityIcons name="calendar-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. 2026-08-15"
              placeholderTextColor={colors.placeholder}
              value={travelDate}
              onChangeText={setTravelDate}
            />
          </View>

          {/* Budget */}
          <Text style={[styles.label, { color: colors.text }]}>Estimated Budget (₹) *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}>
            <MaterialCommunityIcons name="currency-inr" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. 75000"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />
          </View>

          {/* Source Selection */}
          <Text style={[styles.label, { color: colors.text }]}>Lead Acquisition Source</Text>
          <View style={styles.chipGroup}>
            {LEAD_SOURCES.map((src) => (
              <TouchableOpacity
                key={src}
                style={[
                  styles.chip,
                  {
                    backgroundColor: source === src ? colors.primaryLight : colors.surface,
                    borderColor: source === src ? colors.primary : colors.border,
                    borderRadius: borderRadius.round
                  },
                ]}
                onPress={() => setSource(src)}
              >
                <Text style={{ color: source === src ? colors.primary : colors.text, fontSize: 12, fontWeight: '500' }}>
                  {src}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Notes */}
          <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Additional Notes (Optional)</Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.sm,
              },
            ]}
            placeholder="Wants sea view, vegetarian options, traveling with family..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />

          {/* Save Button */}
          <CustomButton
            title="Create Lead"
            onPress={handleSave}
            loading={loading}
            icon="content-save-outline"
            style={styles.saveBtn}
          />
        </Card>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    padding: 16,
    marginVertical: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  packageChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  notesInput: {
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  saveBtn: {
    height: 50,
  },
});
export default AddLeadScreen;
