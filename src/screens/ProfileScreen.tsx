import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useTheme, useAppSelector, useAppDispatch } from '../hooks';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { logout, updateProfile, toggleDarkMode } from '../redux/slices/authSlice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

interface ProfileScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Main'>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors, typography, borderRadius, darkMode } = useTheme();
  const dispatch = useAppDispatch();

  // Retrieve user details from Redux auth store
  const user = useAppSelector(state => state.auth.user);

  // Modal visibility states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Edit Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Change Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(logout());
    navigation.replace('Login');
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone cannot be empty.');
      return;
    }

    dispatch(updateProfile({ name, email, phone }));
    setEditModalVisible(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Confirm password does not match.');
      return;
    }

    setPasswordModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Success', 'Password changed successfully. New JWT token registered.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          User Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: user?.profilePicture || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' }} 
              style={styles.profilePic} 
            />
            <Text style={[styles.userName, { color: colors.text, fontSize: typography.fontSizes.lg }]}>
              {user?.name || 'Vikram Aditya'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.roleText, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>
                {user?.role || 'Sales Manager'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.contactDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text, fontSize: typography.fontSizes.sm }]}>
                {user?.email || 'vikram.aditya@urbancruise.com'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="phone-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text, fontSize: typography.fontSizes.sm }]}>
                {user?.phone || '+91 9876543210'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Preferences / Options Card */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          App Settings
        </Text>
        <Card style={styles.optionsCard}>
          {/* Dark Mode toggle */}
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="theme-light-dark" size={22} color={colors.text} />
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: typography.fontSizes.sm }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={() => { dispatch(toggleDarkMode()); }}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={darkMode ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Edit Profile */}
          <TouchableOpacity 
            style={styles.optionRow} 
            onPress={() => {
              setName(user?.name || '');
              setEmail(user?.email || '');
              setPhone(user?.phone || '');
              setEditModalVisible(true);
            }}
          >
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="account-edit-outline" size={22} color={colors.text} />
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: typography.fontSizes.sm }]}>
                Edit Profile Information
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Change Password */}
          <TouchableOpacity style={styles.optionRow} onPress={() => setPasswordModalVisible(true)}>
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="lock-open-outline" size={22} color={colors.text} />
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: typography.fontSizes.sm }]}>
                Change Password
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>


        {/* Logout Button */}
        <CustomButton
          title="Sign Out"
          onPress={handleLogout}
          type="danger"
          icon="logout"
          style={styles.logoutBtn}
        />
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary, marginTop: 12 }]}>Email Address</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary, marginTop: 12 }]}>Phone Number</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
                value={phone}
                keyboardType="phone-pad"
                onChangeText={setPhone}
              />

              <CustomButton
                title="Save Profile"
                onPress={handleSaveProfile}
                style={{ marginTop: 24, height: 48 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
                Change Password
              </Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Current Password</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
                placeholder="••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary, marginTop: 12 }]}>New Password</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
                placeholder="•••••• (min 6 characters)"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Text style={[styles.modalLabel, { color: colors.textSecondary, marginTop: 12 }]}>Confirm New Password</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
                placeholder="••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <CustomButton
                title="Change Password"
                onPress={handleChangePassword}
                style={{ marginTop: 24, height: 48 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: 24 }]}>
            <View style={styles.logoutModalBody}>
              <View style={[styles.logoutIconCircle, { backgroundColor: colors.dangerLight }]}>
                <MaterialCommunityIcons name="logout" size={36} color={colors.danger} />
              </View>
              <Text style={[styles.logoutTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
                Confirm Sign Out
              </Text>
              <Text style={[styles.logoutSubtitle, { color: colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
                Are you sure you want to sign out of the Urban Cruise Travel LMS?
              </Text>
              
              <View style={styles.logoutButtonRow}>
                <TouchableOpacity 
                  style={[styles.logoutCancelBtn, { borderColor: colors.border }]} 
                  onPress={() => setLogoutModalVisible(false)}
                >
                  <Text style={[styles.logoutCancelText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.logoutConfirmBtn, { backgroundColor: colors.danger }]} 
                  onPress={confirmLogout}
                >
                  <Text style={styles.logoutConfirmText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 4,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  contactDetails: {
    width: '100%',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontWeight: '500',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  optionsCard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontWeight: '500',
  },
  infoCard: {
    marginTop: 16,
    padding: 14,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent',
  },
  infoTitle: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoDesc: {
    lineHeight: 18,
  },
  logoutBtn: {
    marginTop: 16,
    height: 50,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  logoutModalBody: {
    padding: 24,
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoutTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  logoutButtonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  logoutCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCancelText: {
    fontWeight: '600',
  },
  logoutConfirmBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
export default ProfileScreen;
