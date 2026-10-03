import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { useProject } from '../context/ProjectContext';
import { mobileApi } from '../api/client';
import { theme } from '../styles/theme';

export default function BacklogScreen({ onSelectIssue }) {
  const { currentProject, sprints, reloadSprints } = useProject();
  const [issues, setIssues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIssues = useCallback(async () => {
    if (!currentProject) return;
    try {
      setRefreshing(true);
      const data = await mobileApi.filterIssues({ projectId: currentProject.id });
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues', err);
    } finally {
      setRefreshing(false);
    }
  }, [currentProject]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStartSprint = async (sprintId) => {
    try {
      await mobileApi.startSprint(sprintId);
      reloadSprints();
      fetchIssues();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    Alert.alert(
      'Complete Sprint',
      'Incomplete issues will be moved to the backlog.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: async () => {
            try {
              await mobileApi.completeSprint(sprintId);
              reloadSprints();
              fetchIssues();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  const backlogIssues = issues.filter(i => !i.sprintId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchIssues} />}
      >
        <Text style={styles.title}>Scrum Backlog & Sprints</Text>

        {/* Sprints */}
        {sprints.map(sprint => {
          const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
          const points = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

          return (
            <View key={sprint.id} style={styles.sprintCard}>
              <View style={styles.sprintHeader}>
                <View>
                  <Text style={styles.sprintName}>{sprint.name}</Text>
                  <Text style={styles.sprintMeta}>{sprintIssues.length} issues · {points} pts</Text>
                </View>

                {sprint.status === 'ACTIVE' && (
                  <TouchableOpacity 
                    style={styles.completeSprintBtn} 
                    onPress={() => handleCompleteSprint(sprint.id)}
                  >
                    <Text style={styles.completeSprintBtnText}>Complete</Text>
                  </TouchableOpacity>
                )}

                {sprint.status === 'FUTURE' && (
                  <TouchableOpacity 
                    style={styles.startSprintBtn} 
                    onPress={() => handleStartSprint(sprint.id)}
                  >
                    <Text style={styles.startSprintBtnText}>Start</Text>
                  </TouchableOpacity>
                )}
              </View>

              {sprintIssues.map(issue => (
                <TouchableOpacity 
                  key={issue.id} 
                  style={styles.issueRow} 
                  onPress={() => onSelectIssue(issue.id)}
                >
                  <View style={styles.issueRowLeft}>
                    <Text style={styles.issueKey}>{issue.issueKey}</Text>
                    <Text style={styles.issueSummary} numberOfLines={1}>{issue.summary}</Text>
                  </View>
                  <View style={styles.issueRowRight}>
                    <Text style={styles.issueStatus}>{issue.status.replace('_', ' ')}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {sprintIssues.length === 0 && (
                <Text style={styles.emptySprintText}>No issues in this sprint</Text>
              )}
            </View>
          );
        })}

        {/* Backlog */}
        <View style={styles.sprintCard}>
          <View style={styles.sprintHeader}>
            <Text style={styles.sprintName}>Backlog ({backlogIssues.length} issues)</Text>
          </View>
          {backlogIssues.map(issue => (
            <TouchableOpacity 
              key={issue.id} 
              style={styles.issueRow} 
              onPress={() => onSelectIssue(issue.id)}
            >
              <View style={styles.issueRowLeft}>
                <Text style={styles.issueKey}>{issue.issueKey}</Text>
                <Text style={styles.issueSummary} numberOfLines={1}>{issue.summary}</Text>
              </View>
              <View style={styles.issueRowRight}>
                <Text style={styles.issueStatus}>{issue.status.replace('_', ' ')}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {backlogIssues.length === 0 && (
            <Text style={styles.emptySprintText}>Backlog is empty</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface
  },
  scrollContent: {
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16
  },
  sprintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
    overflow: 'hidden'
  },
  sprintHeader: {
    backgroundColor: '#FAFBFC',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sprintName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  sprintMeta: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  startSprintBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  startSprintBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  completeSprintBtn: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  completeSprintBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F7'
  },
  issueRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  issueKey: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  issueSummary: {
    fontSize: 13,
    color: theme.colors.text,
    flex: 1
  },
  issueRowRight: {
    marginLeft: 8
  },
  issueStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    backgroundColor: '#EBECF0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3
  },
  emptySprintText: {
    padding: 16,
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12
  }
});
