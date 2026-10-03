import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Alert 
} from 'react-native';
import { useProject } from '../context/ProjectContext';
import { mobileApi } from '../api/client';
import { theme } from '../styles/theme';

export default function CreateIssueModal({ visible, onClose, onCreated }) {
  const { currentProject, sprints } = useProject();
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('TASK');
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeId, setAssigneeId] = useState(null);
  const [sprintId, setSprintId] = useState(null);
  const [storyPoints, setStoryPoints] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!summary.trim() || !currentProject) {
      Alert.alert('Required', 'Please enter a summary');
      return;
    }

    setLoading(true);
    try {
      await mobileApi.createIssue({
        projectId: currentProject.id,
        summary: summary.trim(),
        description: description.trim() || null,
        type,
        priority,
        status: 'TO_DO',
        assigneeId: assigneeId ? Number(assigneeId) : null,
        sprintId: sprintId ? Number(sprintId) : null,
        storyPoints: storyPoints ? Number(storyPoints) : null
      });

      setSummary('');
      setDescription('');
      setStoryPoints('');
      onCreated();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Issue</Text>
          <TouchableOpacity onPress={handleCreate} style={styles.createBtn} disabled={loading}>
            <Text style={styles.createBtnText}>{loading ? 'Saving...' : 'Create'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.label}>Summary *</Text>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            value={summary}
            onChangeText={setSummary}
            autoFocus
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed description..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Issue Type</Text>
          <View style={styles.chipRow}>
            {['TASK', 'STORY', 'BUG', 'EPIC'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, type === t && styles.chipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipRow}>
            {['HIGHEST', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, priority === p && styles.chipActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Assign to Member</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, assigneeId === null && styles.chipActive]}
              onPress={() => setAssigneeId(null)}
            >
              <Text style={[styles.chipText, assigneeId === null && styles.chipTextActive]}>Unassigned</Text>
            </TouchableOpacity>
            {currentProject?.members?.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.chip, assigneeId === m.id && styles.chipActive]}
                onPress={() => setAssigneeId(m.id)}
              >
                <Text style={[styles.chipText, assigneeId === m.id && styles.chipTextActive]}>
                  {m.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Story Points</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1, 2, 3, 5, 8"
            keyboardType="numeric"
            value={storyPoints}
            onChangeText={setStoryPoints}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  closeBtnText: {
    color: theme.colors.textMuted,
    fontSize: 15
  },
  createBtnText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: 'bold'
  },
  scrollContent: {
    padding: 16
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginTop: 14,
    marginBottom: 6
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F4F5F7',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  chipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600'
  },
  chipTextActive: {
    color: theme.colors.primary
  }
});
