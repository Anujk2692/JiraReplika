import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Image,
  SafeAreaView
} from 'react-native';
import { useProject } from '../context/ProjectContext';
import { mobileApi } from '../api/client';
import { theme } from '../styles/theme';

const STATUSES = ['ALL', 'BACKLOG', 'TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function KanbanScreen({ onSelectIssue, onOpenCreate }) {
  const { currentProject, activeSprint } = useProject();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [issues, setIssues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIssues = useCallback(async () => {
    if (!currentProject) return;
    try {
      setRefreshing(true);
      const data = await mobileApi.filterIssues({
        projectId: currentProject.id,
        status: selectedStatus === 'ALL' ? null : selectedStatus
      });
      setIssues(data);
    } catch (err) {
      console.error('Failed to fetch mobile issues', err);
    } finally {
      setRefreshing(false);
    }
  }, [currentProject, selectedStatus]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const renderIssueCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onSelectIssue(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.keyRow}>
          <View style={[styles.typeBadge, { backgroundColor: theme.colors.types[item.type] || '#4BADE8' }]}>
            <Text style={styles.typeBadgeText}>{item.type.substring(0, 1)}</Text>
          </View>
          <Text style={styles.issueKey}>{item.issueKey}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: theme.colors.status[item.status] || '#DFE1E6' }]}>
          <Text style={styles.statusBadgeText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <Text style={styles.summaryText}>{item.summary}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.priorityBox}>
          <Text style={[styles.priorityText, { color: theme.colors.priorities[item.priority] || '#FFAB00' }]}>
            {item.priority}
          </Text>
          {item.storyPoints != null && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{item.storyPoints}</Text>
            </View>
          )}
        </View>

        <View style={styles.assigneeBox}>
          {item.assignee ? (
            <View style={styles.assigneeRow}>
              <Image source={{ uri: item.assignee.avatarUrl }} style={styles.assigneeAvatar} />
              <Text style={styles.assigneeName}>{item.assignee.name.split(' ')[0]}</Text>
            </View>
          ) : (
            <Text style={styles.unassignedText}>Unassigned</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Project & Sprint Bar */}
      <View style={styles.topInfoBar}>
        <View>
          <Text style={styles.projectTitle}>{currentProject?.name}</Text>
          <Text style={styles.projectSubtitle}>
            {activeSprint ? `Active: ${activeSprint.name}` : 'Kanban Board'}
          </Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={onOpenCreate}>
          <Text style={styles.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUSES}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.statusTab, selectedStatus === item && styles.statusTabActive]}
              onPress={() => setSelectedStatus(item)}
            >
              <Text style={[styles.statusTabText, selectedStatus === item && styles.statusTabTextActive]}>
                {item.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Issues List */}
      <FlatList
        data={issues}
        keyExtractor={item => item.id.toString()}
        renderItem={renderIssueCard}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchIssues} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No issues in this view.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface
  },
  topInfoBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  projectSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  createBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  statusTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#F4F5F7'
  },
  statusTabActive: {
    backgroundColor: theme.colors.primaryLight
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  statusTabTextActive: {
    color: theme.colors.primary
  },
  listContent: {
    padding: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  typeBadge: {
    width: 18,
    height: 18,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  issueKey: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textSecondary
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F4F5F7',
    paddingTop: 8
  },
  priorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  pointsBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  pointsText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.textSecondary
  },
  assigneeBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  assigneeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  assigneeName: {
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  unassignedText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14
  }
});
