import React, { useState } from 'react';
import { View, Text, Button, FlatList, Alert, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import i18n from '../i18n';

export default function CleanerScreen() {
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);

  async function scan() {
    setScanning(true);
    // Simple scan: check documentDirectory files and list large ones
    try {
      const dir = FileSystem.documentDirectory;
      const list = await FileSystem.readDirectoryAsync(dir);
      const items = await Promise.all(list.map(async (name) => {
        const uri = dir + name;
        const info = await FileSystem.getInfoAsync(uri, { size: true });
        return { name, uri, size: info.size || 0 };
      }));
      const large = items.filter(i=>i.size > 1024 * 100); // >100kb
      setResults(large);
    } catch (e) {
      Alert.alert('Error', e.message || e.toString());
    }
    setScanning(false);
  }

  async function remove(item) {
    Alert.alert(i18n.t('confirmDelete'), item.name, [
      { text: i18n.t('cancel') },
      { text: i18n.t('delete'), onPress: async ()=>{
        try { await FileSystem.deleteAsync(item.uri); setResults(r=>r.filter(x=>x.uri!==item.uri)); Alert.alert(i18n.t('done')) } catch(e) { Alert.alert('Error', e.message) }
      }}
    ]);
  }

  return (
    <View style={{flex:1, padding:12}}>
      <Button title={i18n.t('scanStorage')} onPress={scan} disabled={scanning} />
      <FlatList data={results} keyExtractor={(i)=>i.uri} renderItem={({item}) => (
        <View style={styles.row}>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.size} bytes</Text>
          </View>
          <Button title={i18n.t('delete')} onPress={()=>remove(item)} />
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({ row:{flexDirection:'row', justifyContent:'space-between', padding:12, borderBottomWidth:1, borderColor:'#eee'}, name:{fontSize:16}, meta:{fontSize:12, color:'#666'} });
