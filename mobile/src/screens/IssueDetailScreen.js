import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Image, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { mobileApi } from '../api/client';
import { theme } from '../styles/theme';

const STATUS_OPTIONS = ['BACKLOG', 'TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITY_OPTIONS = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];

export default function IssueDetailScreen({ issueId, onClose, onUpdated }) {
  const { currentProject } = useProject();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals for picking fields
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [issueData, commentData, activityData] = await Promise.all([
        mobileApi.getIssueById(issueId),
        mobileApi.getComments(issueId),
        mobileApi.getActivity(issueId)
      ]);
      setIssue(issueData);
      setComments(commentData);
      setActivities(activityData);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (status) => {
    try {
      await mobileApi.updateStatus(issue.id, status);
      setShowStatusModal(false);
      loadData();
      onUpdated();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleUpdateAssignee = async (assigneeId) => {
    try {
      await mobileApi.updateAssignee(issue.id, assigneeId);
      setShowAssigneeModal(false);
      loadData();
      onUpdated();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleUpdatePriority = async (priority) => {
    try {
      await mobileApi.updateIssue(issue.id, { priority });
      setShowPriorityModal(false);
      loadData();
      onUpdated();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await mobileApi.addComment(issue.id, newComment.trim());
      setNewComment('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (!issue) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Text style={styles.backBtnText}>&larr; Back</Text>
        </TouchableOpacity>
        <Text style={styles.topKeyText}>{issue.issueKey}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.summaryTitle}>{issue.summary}</Text>

        {/* Quick Attribute Pills */}
        <View style={styles.pillsRow}>
          {/* Status Picker Button */}
          <TouchableOpacity 
            style={[styles.pillBtn, { backgroundColor: theme.colors.status[issue.status] || '#DFE1E6' }]}
            onPress={() => setShowStatusModal(true)}
          >
            <Text style={styles.pillBtnText}>{issue.status.replace('_', ' ')} &#9662;</Text>
          </TouchableOpacity>

          {/* Priority Picker Button */}
          <TouchableOpacity 
            style={styles.pillBtnOutline}
            onPress={() => setShowPriorityModal(true)}
          >
            <Text style={[styles.pillBtnText, { color: theme.colors.priorities[issue.priority] }]}>
              {issue.priority} &#9662;
            </Text>
          </TouchableOpacity>

          {/* Points Pill */}
          {issue.storyPoints != null && (
            <View style={styles.pointsPill}>
              <Text style={styles.pointsPillText}>{issue.storyPoints} pts</Text>
            </View>
          )}
        </View>

        {/* Assignee Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Assignee</Text>
          <TouchableOpacity 
            style={styles.assigneeSelector} 
            onPress={() => setShowAssigneeModal(true)}
          >
            {issue.assignee ? (
              <View style={styles.assigneeRow}>
                <Image source={{ uri: issue.assignee.avatarUrl }} style={styles.userAvatar} />
                <View>
                  <Text style={styles.userName}>{issue.assignee.name}</Text>
                  <Text style={styles.userEmail}>{issue.assignee.email}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.unassignedPrompt}>+ Assign to team member</Text>
            )}
            <Text style={styles.changeActionText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Description Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descBody}>
            {issue.description || 'No description provided.'}
          </Text>
        </View>

        {/* Comments Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

          {/* Add Comment Input */}
          <View style={styles.addCommentBox}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              multiline
              value={newComment}
              onChangeText={setNewComment}
            />
            {newComment.trim().length > 0 && (
              <TouchableOpacity style={styles.postCommentBtn} onPress={handleAddComment}>
                <Text style={styles.postCommentText}>Send</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Comments List */}
          {comments.map(c => (
            <View key={c.id} style={styles.commentItem}>
              <Image source={{ uri: c.author?.avatarUrl }} style={styles.commentAvatar} />
              <View style={styles.commentBubble}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{c.author?.name}</Text>
                  <Text style={styles.commentTime}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={styles.commentText}>{c.content}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* History Audit Trail */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Activity History</Text>
          {activities.map(act => (
            <View key={act.id} style={styles.historyRow}>
              <Text style={styles.historyBullet}>&bull;</Text>
              <Text style={styles.historyText}>
                <Text style={{ fontWeight: 'bold' }}>{act.user?.name}</Text> {act.action.replace('_', ' ').toLowerCase()}:
                {act.fieldName ? ` ${act.fieldName}` : ''}
                {act.oldValue ? ` from ${act.oldValue}` : ''}
                {act.newValue ? ` to ${act.newValue}` : ''}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Status Picker Modal */}
      <Modal visible={showStatusModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Change Status</Text>
            {STATUS_OPTIONS.map(st => (
              <TouchableOpacity 
                key={st} 
                style={styles.pickerOption} 
                onPress={() => handleUpdateStatus(st)}
              >
                <Text style={[styles.pickerOptionText, issue.status === st && { color: theme.colors.primary, fontWeight: 'bold' }]}>
                  {st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelPickerBtn} onPress={() => setShowStatusModal(false)}>
              <Text style={styles.cancelPickerText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Priority Picker Modal */}
      <Modal visible={showPriorityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Change Priority</Text>
            {PRIORITY_OPTIONS.map(p => (
              <TouchableOpacity 
                key={p} 
                style={styles.pickerOption} 
                onPress={() => handleUpdatePriority(p)}
              >
                <Text style={[styles.pickerOptionText, { color: theme.colors.priorities[p] }]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelPickerBtn} onPress={() => setShowPriorityModal(false)}>
              <Text style={styles.cancelPickerText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assignee Picker Modal */}
      <Modal visible={showAssigneeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Assign to Member</Text>
            <TouchableOpacity 
              style={styles.pickerOption} 
              onPress={() => handleUpdateAssignee(null)}
            >
              <Text style={styles.pickerOptionText}>Unassigned</Text>
            </TouchableOpacity>
            {currentProject?.members?.map(m => (
              <TouchableOpacity 
                key={m.id} 
                style={styles.pickerOption} 
                onPress={() => handleUpdateAssignee(m.id)}
              >
                <View style={styles.assigneeRow}>
                  <Image source={{ uri: m.avatarUrl }} style={styles.userAvatar} />
                  <Text style={styles.pickerOptionText}>{m.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelPickerBtn} onPress={() => setShowAssigneeModal(false)}>
              <Text style={styles.cancelPickerText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  backBtn: {
    padding: 6
  },
  backBtnText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold'
  },
  topKeyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  scrollContent: {
    padding: 16
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  pillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4
  },
  pillBtnOutline: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  pointsPill: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4
  },
  pointsPillText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textSecondary
  },
  sectionCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  descBody: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20
  },
  assigneeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  userEmail: {
    fontSize: 11,
    color: theme.colors.textMuted
  },
  unassignedPrompt: {
    color: theme.colors.primary,
    fontSize: 14
  },
  changeActionText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold'
  },
  addCommentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 13
  },
  postCommentBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6
  },
  postCommentText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 10
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  commentTime: {
    fontSize: 10,
    color: theme.colors.textMuted
  },
  commentText: {
    fontSize: 13,
    color: theme.colors.text
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6
  },
  historyBullet: {
    color: theme.colors.textMuted,
    fontSize: 16
  },
  historyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20
  },
  pickerModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  pickerOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F7'
  },
  pickerOptionText: {
    fontSize: 15,
    color: theme.colors.text
  },
  cancelPickerBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  cancelPickerText: {
    color: theme.colors.danger,
    fontWeight: 'bold',
    fontSize: 15
  }
});
