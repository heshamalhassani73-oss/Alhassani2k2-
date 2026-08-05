// basic component placeholder for file items
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function FileItem({ item, onPress }) {
  return (
    <TouchableOpacity onPress={()=>onPress && onPress(item)} style={styles.row}>
      <Text style={styles.text}>{item.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ row:{padding:12, borderBottomWidth:1, borderColor:'#eee'}, text:{fontSize:16} });
