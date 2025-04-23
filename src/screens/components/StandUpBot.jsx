import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, Linking, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const StandUpBot = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerStartTime, setTimerStartTime] = useState(null);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        'https://teamsapp.atlassian.net/rest/api/3/search',
        {
          params: {
            jql: 'assignee = currentUser() AND status IN ("To Do", "In Progress", "Done")',
            fields: 'key,summary,status'
          },
          auth: {
            username: await AsyncStorage.getItem('email'),
            password: await AsyncStorage.getItem('jiraToken')
          }
        }
      );
      setTasks(response.data.issues);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
      console.error(error);
    }
  };

  const handleTimer = (taskId) => {
    if (activeTimer === taskId) {
      // Stop the timer
      const timeSpent = Date.now() - timerStartTime;
      Alert.alert(
        'Timer Stopped', 
        `You worked on this task for ${Math.floor(timeSpent / 60000)} minutes`
      );
      setActiveTimer(null);
      setTimerStartTime(null);
    } else {
      // Start the timer
      setActiveTimer(taskId);
      setTimerStartTime(Date.now());
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={fetchTasks}
        style={styles.refreshButton}
      >
        <Text style={styles.refreshButtonText}>
          Refresh My Tasks
        </Text>
      </TouchableOpacity>
      
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskKey}>
              {item.key}
            </Text>
            <Text style={styles.taskSummary}>{item.fields.summary}</Text>
            <Text style={[
              styles.taskStatus,
              item.fields.status.name === "Done" && { color: 'green' }
            ]}>
              Status: {item.fields.status.name}
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={() => Linking.openURL(`https://teamsapp.atlassian.net/browse/${item.key}`)}
                style={styles.jiraButton}
              >
                <MaterialIcon name="jira" size={16} color="#2684FF" />
                <Text style={styles.jiraButtonText}>View in Jira</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleTimer(item.id)}
                style={[
                  styles.timerButton,
                  activeTimer === item.id && styles.timerButtonActive
                ]}
                disabled={activeTimer !== null && activeTimer !== item.id}
              >
                <Text style={styles.timerButtonText}>
                  {activeTimer === item.id ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No tasks found or press refresh to load
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff'
  },
  refreshButton: {
    backgroundColor: '#0052CC',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20
  },
  refreshButtonText: {
    color: 'white', 
    fontWeight: 'bold'
  },
  taskCard: {
    padding: 15, 
    marginBottom: 15, 
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#0052CC'
  },
  taskKey: { 
    fontWeight: 'bold', 
    color: '#0052CC',
    fontSize: 16
  },
  taskSummary: {
    fontSize: 14,
    marginVertical: 5
  },
  taskStatus: { 
    color: '#666', 
    marginTop: 5,
    fontSize: 12
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  jiraButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginRight: 5
  },
  jiraButtonText: {
    color: '#0052CC',
    marginLeft: 5,
    fontSize: 12
  },
  timerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052CC',
    padding: 8,
    borderRadius: 4,
    marginLeft: 5
  },
  timerButtonActive: {
    backgroundColor: '#cc0000'
  },
  timerButtonText: {
    color: 'white',
    fontSize: 12
  },
  emptyText: {
    textAlign: 'center', 
    marginTop: 20,
    color: '#666'
  }
});

export default StandUpBot;