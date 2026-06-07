import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks';
import { CustomButton } from '../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import axios from 'axios';
import { API_BASE_URL, USE_REAL_BACKEND } from '../config/apiConfig';

type ForgotPasswordNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordNavigationProp;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { colors, typography, borderRadius } = useTheme();
  
  // Navigation Steps: 1 = Email Input, 2 = OTP & Password Input, 3 = Success Screen
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailStr: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(emailStr);
  };

  // Step 1: Request Reset Code (OTP)
  const handleRequestOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (USE_REAL_BACKEND) {
        const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
          email: email.toLowerCase().trim(),
        });
        
        setLoading(false);
        // Show the sandbox OTP code to make testing/debugging extremely easy for the developer
        const returnedOtp = response.data.otp;
        Alert.alert(
          'Verification Code Sent',
          `A 6-digit OTP code has been generated. For testing/local sandbox verification, use code: ${returnedOtp}`,
          [{ text: 'OK', onPress: () => setStep(2) }]
        );
      } else {
        // Simulated Mock Mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        
        const emailFormatted = email.toLowerCase().trim();
        if (emailFormatted === 'agent@urbancruise.com' || emailFormatted === 'admin@urbancruise.com') {
          Alert.alert(
            'Verification Code (Mock Mode)',
            'A 6-digit OTP code has been generated. For mock verification, use: 123456',
            [{ text: 'OK', onPress: () => setStep(2) }]
          );
        } else {
          Alert.alert('Error', 'No account found with this email in mock mode. Hint: Use agent@urbancruise.com');
        }
      }
    } catch (error: any) {
      setLoading(false);
      const errMsg = error.response?.data?.message || 'Connection error. Make sure your backend server is running.';
      Alert.alert('Error', errMsg);
    }
  };

  // Step 2: Complete Password Reset
  const handleResetPassword = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit verification code.');
      return;
    }
    if (!newPassword) {
      Alert.alert('Validation Error', 'Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (USE_REAL_BACKEND) {
        await axios.post(`${API_BASE_URL}/auth/reset-password`, {
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
          newPassword,
        });

        setLoading(false);
        setStep(3);
      } else {
        // Simulated Mock Mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);

        if (otp.trim() === '123456') {
          setStep(3);
        } else {
          Alert.alert('Verification Error', 'Invalid or expired verification code. Hint: Use 123456');
        }
      }
    } catch (error: any) {
      setLoading(false);
      const errMsg = error.response?.data?.message || 'Failed to reset password. Please check your verification code.';
      Alert.alert('Error', errMsg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons 
              name={step === 3 ? "check-circle-outline" : step === 2 ? "key-change" : "lock-reset"} 
              size={40} 
              color={colors.primary} 
            />
          </View>
          <Text style={[styles.title, { color: colors.text, fontSize: typography.fontSizes.xl }]}>
            {step === 3 ? 'Password Updated!' : step === 2 ? 'Verification' : 'Forgot Password?'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
            {step === 3
              ? 'Your password has been successfully reset. You can now log in with your new password.'
              : step === 2
              ? `Enter the 6-digit verification code sent to ${email} along with your new password.`
              : 'No worries! Enter your registered email address below and we\'ll generate a verification code to reset it.'}
          </Text>
        </View>

        {step === 1 && (
          <View style={styles.form}>
            {/* Email field */}
            <Text style={[styles.label, { color: colors.text, fontSize: typography.fontSizes.xs }]}>
              Email Address
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. agent@urbancruise.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Send OTP Button */}
            <CustomButton
              title="Get Verification Code"
              onPress={handleRequestOTP}
              loading={loading}
              icon="key-outline"
              style={styles.actionButton}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.form}>
            {/* OTP field */}
            <Text style={[styles.label, { color: colors.text, fontSize: typography.fontSizes.xs }]}>
              Verification Code (OTP)
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <MaterialCommunityIcons name="shield-key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            {/* New Password field */}
            <Text style={[styles.label, { color: colors.text, fontSize: typography.fontSizes.xs }]}>
              New Password
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            {/* Confirm Password field */}
            <Text style={[styles.label, { color: colors.text, fontSize: typography.fontSizes.xs }]}>
              Confirm New Password
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <MaterialCommunityIcons name="lock-check-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Reset Button */}
            <CustomButton
              title="Update Password"
              onPress={handleResetPassword}
              loading={loading}
              icon="lock-reset"
              style={styles.actionButton}
            />
          </View>
        )}

        {step === 3 && (
          <View style={[styles.successBox, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.md }]}>
            <MaterialCommunityIcons name="check-circle" size={48} color={colors.primary} style={styles.successIcon} />
            <Text style={[styles.successTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
              Password Reset Success!
            </Text>
            <Text style={[styles.successDescription, { color: colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
              Your account security has been updated. Please sign in again with your new credentials.
            </Text>
            <CustomButton
              title="Back to Sign In"
              onPress={() => navigation.navigate('Login')}
              type="primary"
              style={styles.backSignInBtn}
            />
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.footerLink, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>
              Remember your password? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 60,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  form: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  actionButton: {
    height: 52,
    marginTop: 10,
  },
  successBox: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successDescription: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  backSignInBtn: {
    width: '100%',
    height: 48,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerLink: {
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
