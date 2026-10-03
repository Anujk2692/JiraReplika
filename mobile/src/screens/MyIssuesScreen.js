import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  SafeAreaView 
} from 'react-native';
import { mobileApi } from '../api/client';
import { theme } from '../styles/theme';

export default function MyIssuesScreen({ onSelectIssue }) {
  const [issues, setIssues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyIssues = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await mobileApi.getMyIssues();
      setIssues(data);
    } catch (err) {
      console.error('Failed to load my issues', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyIssues();
  }, [fetchMyIssues]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assigned to Me ({issues.length})</Text>
      </View>

      <FlatList
        data={issues}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyIssues} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => onSelectIssue(item.id)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.keyText}>{item.issueKey}</Text>
              <Text style={[styles.statusTag, { backgroundColor: theme.colors.status[item.status] || '#DFE1E6' }]}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
            <Text style={styles.summaryText}>{item.summary}</Text>
            <View style={styles.cardBottom}>
              <Text style={[styles.priorityText, { color: theme.colors.priorities[item.priority] }]}>
                {item.priority}
              </Text>
              <Text style={styles.projectNameText}>{item.projectName}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>You have no assigned issues.</Text>
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
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  listContent: {
    padding: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  keyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  statusTag: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 10
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  projectNameText: {
    fontSize: 11,
    color: theme.colors.textMuted
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14
  }
});
