import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import axios from 'axios';

const StandUpBot = () => {
  const [tasks, setTasks] = useState([]);

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
            username: 'bsce21037@itu.edu.pk',
            password: 'ATATT3xFfGF0ylHNpv6KfoJ32tGHvOPDxIV49bcBorY_h9DffaJTyf9S7lk9SGMCpE0UJJHRr0gK9UlMY_QgExJe3AbpLHp45JW1duJ8wwLsvcwfAsTBtZgPjzQHzYXVXCR9YVHHbFQH1aKGZVficlYjmG2usmHNOMBckTQZWE1vnO6JgpqoA-U=729D00CE'
          }
        }
      );
      setTasks(response.data.issues);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
      console.error(error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity 
        onPress={fetchTasks}
        style={{
          backgroundColor: '#0052CC',
          padding: 15,
          borderRadius: 5,
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Refresh My Tasks
        </Text>
      </TouchableOpacity>
      
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ 
            padding: 15, 
            marginBottom: 10, 
            backgroundColor: '#f5f5f5',
            borderRadius: 5
          }}>
            <Text style={{ fontWeight: 'bold', color: '#0052CC' }}>
              {item.key}
            </Text>
            <Text>{item.fields.summary}</Text>
            <Text style={[
              { color: '#666', marginTop: 5 },
              item.fields.status.name === "Done" && { color: 'green' }
            ]}>
              Status: {item.fields.status.name}
          </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No tasks found or press refresh to load
          </Text>
        }
      />
    </View>
  );
};

export default StandUpBot;