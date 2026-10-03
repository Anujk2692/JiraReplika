import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { setServerUrl, getServerUrl } from '../api/client';
import { theme } from '../styles/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setCustomServerUrl] = useState(getServerUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (targetEmail, targetPassword) => {
    setLoading(true);
    try {
      await login(targetEmail || email, targetPassword || password);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServerUrl = () => {
    setServerUrl(serverUrl);
    Alert.alert('Server Updated', `API endpoint set to: ${serverUrl}`);
    setShowServerConfig(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>J</Text>
          </View>
          <Text style={styles.logoTitle}>Jira Software</Text>
          <Text style={styles.logoSubtitle}>Mobile Agile Workspace</Text>
        </View>

        {/* 1-Tap Quick Demo Users */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>QUICK 1-TAP DEMO LOGIN</Text>
          <View style={styles.demoGrid}>
            <TouchableOpacity 
              style={styles.demoBtn} 
              onPress={() => handleLogin('alex.admin@jira.dev', 'Password123!')}
            >
              <Text style={styles.demoBtnName}>Alex Rivera</Text>
              <Text style={styles.demoBtnRole}>Admin / Lead</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.demoBtn} 
              onPress={() => handleLogin('sarah.lead@jira.dev', 'Password123!')}
            >
              <Text style={styles.demoBtnName}>Sarah Chen</Text>
              <Text style={styles.demoBtnRole}>Product Lead</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.demoBtn} 
              onPress={() => handleLogin('david.dev@jira.dev', 'Password123!')}
            >
              <Text style={styles.demoBtnName}>David Miller</Text>
              <Text style={styles.demoBtnRole}>Senior Dev</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.demoBtn} 
              onPress={() => handleLogin('elena.qa@jira.dev', 'Password123!')}
            >
              <Text style={styles.demoBtnName}>Elena Rostova</Text>
              <Text style={styles.demoBtnRole}>QA Engineer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Standard Form */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Work Email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@company.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.formLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={[styles.loginBtn, loading && styles.btnDisabled]} 
            onPress={() => handleLogin()}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </TouchableOpacity>
        </View>

        {/* Backend Server URL Config */}
        <TouchableOpacity 
          style={styles.configToggle} 
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <Text style={styles.configToggleText}>
            ⚙️ Backend Server Settings ({getServerUrl()})
          </Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.configBox}>
            <Text style={styles.configLabel}>API Endpoint URL:</Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setCustomServerUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.saveServerBtn} onPress={handleSaveServerUrl}>
              <Text style={styles.saveServerBtnText}>Save Server URL</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center'
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 24
  },
  logoIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  logoIconText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold'
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  logoSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4
  },
  demoBox: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center'
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between'
  },
  demoBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  demoBtnName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  demoBtnRole: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  formSection: {
    width: '100%',
    marginBottom: 20
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text
  },
  loginBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20
  },
  btnDisabled: {
    opacity: 0.6
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  configToggle: {
    padding: 10
  },
  configToggleText: {
    fontSize: 12,
    color: theme.colors.primary,
    textDecorationLine: 'underline'
  },
  configBox: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 6,
    marginTop: 10
  },
  configLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6
  },
  saveServerBtn: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8
  },
  saveServerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  }
});
