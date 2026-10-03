import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Modal,
  Image 
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ProjectProvider, useProject } from './src/context/ProjectContext';
import LoginScreen from './src/screens/LoginScreen';
import KanbanScreen from './src/screens/KanbanScreen';
import BacklogScreen from './src/screens/BacklogScreen';
import MyIssuesScreen from './src/screens/MyIssuesScreen';
import IssueDetailScreen from './src/screens/IssueDetailScreen';
import CreateIssueModal from './src/screens/CreateIssueModal';
import { theme } from './src/styles/theme';

function MainApp() {
  const { user, isAuthenticated, logout } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProject();
  const [currentTab, setCurrentTab] = useState('board'); // 'board' | 'backlog' | 'my-issues'
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main Top Header */}
      <View style={styles.header}>
        {/* Project Selector */}
        <TouchableOpacity 
          style={styles.projectPickerBtn} 
          onPress={() => setShowProjectPicker(true)}
        >
          <View style={styles.projectKeyBox}>
            <Text style={styles.projectKeyText}>{currentProject?.key?.substring(0, 2) || 'PR'}</Text>
          </View>
          <Text style={styles.headerProjectName} numberOfLines={1}>
            {currentProject?.name || 'Projects'}
          </Text>
          <Text style={styles.dropdownArrow}>&#9662;</Text>
        </TouchableOpacity>

        {/* User Avatar */}
        <TouchableOpacity onPress={() => setShowUserMenu(true)}>
          <Image 
            source={{ uri: user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User' }} 
            style={styles.headerAvatar} 
          />
        </TouchableOpacity>
      </View>

      {/* Main Screen Body */}
      <View style={styles.screenBody}>
        {currentTab === 'board' && (
          <KanbanScreen 
            key={`board-${refreshTrigger}`}
            onSelectIssue={setSelectedIssueId}
            onOpenCreate={() => setShowCreateModal(true)}
          />
        )}

        {currentTab === 'backlog' && (
          <BacklogScreen 
            key={`backlog-${refreshTrigger}`}
            onSelectIssue={setSelectedIssueId}
          />
        )}

        {currentTab === 'my-issues' && (
          <MyIssuesScreen 
            key={`my-${refreshTrigger}`}
            onSelectIssue={setSelectedIssueId}
          />
        )}
      </View>

      {/* Bottom Navigation Tabs */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, currentTab === 'board' && styles.tabItemActive]}
          onPress={() => setCurrentTab('board')}
        >
          <Text style={[styles.tabLabel, currentTab === 'board' && styles.tabLabelActive]}>Board</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, currentTab === 'backlog' && styles.tabItemActive]}
          onPress={() => setCurrentTab('backlog')}
        >
          <Text style={[styles.tabLabel, currentTab === 'backlog' && styles.tabLabelActive]}>Backlog</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, currentTab === 'my-issues' && styles.tabItemActive]}
          onPress={() => setCurrentTab('my-issues')}
        >
          <Text style={[styles.tabLabel, currentTab === 'my-issues' && styles.tabLabelActive]}>My Issues</Text>
        </TouchableOpacity>
      </View>

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <Modal visible animationType="slide">
          <IssueDetailScreen
            issueId={selectedIssueId}
            onClose={() => setSelectedIssueId(null)}
            onUpdated={() => setRefreshTrigger(t => t + 1)}
          />
        </Modal>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => setRefreshTrigger(t => t + 1)}
      />

      {/* Project Switcher Modal */}
      <Modal visible={showProjectPicker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Select Project</Text>
            {projects.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.dialogOption, currentProject?.id === p.id && styles.dialogOptionActive]}
                onPress={() => {
                  setCurrentProject(p);
                  setShowProjectPicker(false);
                }}
              >
                <View style={styles.projectKeyBox}>
                  <Text style={styles.projectKeyText}>{p.key.substring(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dialogOptionName}>{p.name}</Text>
                  <Text style={styles.dialogOptionMeta}>{p.key} · Software project</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.dialogCancelBtn} onPress={() => setShowProjectPicker(false)}>
              <Text style={styles.dialogCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User Menu Modal */}
      <Modal visible={showUserMenu} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.dialogCard}>
            <View style={styles.userMenuProfile}>
              <Image source={{ uri: user?.avatarUrl }} style={styles.userMenuAvatar} />
              <View>
                <Text style={styles.userMenuName}>{user?.name}</Text>
                <Text style={styles.userMenuEmail}>{user?.email}</Text>
                <Text style={styles.userMenuRole}>{user?.role?.replace('ROLE_', '')}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.logoutBtn} 
              onPress={() => {
                setShowUserMenu(false);
                logout();
              }}
            >
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dialogCancelBtn} onPress={() => setShowUserMenu(false)}>
              <Text style={styles.dialogCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <MainApp />
      </ProjectProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  projectPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  projectKeyBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  projectKeyText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  headerProjectName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    maxWidth: 200
  },
  dropdownArrow: {
    fontSize: 14,
    color: theme.colors.textMuted
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  screenBody: {
    flex: 1
  },
  bottomTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
    marginTop: -2
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  tabLabelActive: {
    color: theme.colors.primary
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 360
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16
  },
  dialogOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F7'
  },
  dialogOptionActive: {
    backgroundColor: theme.colors.surface
  },
  dialogOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  dialogOptionMeta: {
    fontSize: 11,
    color: theme.colors.textMuted
  },
  dialogCancelBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10
  },
  dialogCancelText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14
  },
  userMenuProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  userMenuAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  userMenuName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  userMenuEmail: {
    fontSize: 12,
    color: theme.colors.textMuted
  },
  userMenuRole: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: 2
  },
  logoutBtn: {
    backgroundColor: '#FFEBE6',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8
  },
  logoutBtnText: {
    color: '#DE350B',
    fontWeight: 'bold',
    fontSize: 14
  }
});
