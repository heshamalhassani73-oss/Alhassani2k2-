import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import i18n from '../i18n';

function FileRow({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(item)}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>{item.size ? (item.size + ' bytes') : ''}</Text>
    </TouchableOpacity>
  );
}

export default function FileBrowser() {
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState(FileSystem.documentDirectory);

  useEffect(() => {
    loadDirectory(path);
  }, [path]);

  async function loadDirectory(dir) {
    try {
      const list = await FileSystem.readDirectoryAsync(dir);
      const items = await Promise.all(list.map(async (name) => {
        const full = dir + name;
        const info = await FileSystem.getInfoAsync(full, { size: true });
        return { name, uri: full, isDirectory: info.isDirectory, size: info.size };
      }));
      setFiles(items);
    } catch (e) {
      Alert.alert(i18n.t('noAccess'));
    }
  }

  async function pickFolder() {
    // DocumentPicker for folders not supported widely; we open a file and use its folder.
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
    if (res.type === 'success') {
      const folder = res.uri.replace(/\\[^\\/]+$/, '/');
      setPath(folder);
    }
  }

  function openItem(item) {
    if (item.isDirectory) {
      setPath(item.uri + '/');
    } else {
      Alert.alert(item.name, item.uri);
    }
  }

  return (
    <View style={{flex:1}}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{path}</Text>
        <TouchableOpacity onPress={pickFolder} style={styles.pickBtn}><Text>{i18n.t('selectFolder')}</Text></TouchableOpacity>
      </View>
      <FlatList data={files} keyExtractor={(i)=>i.uri} renderItem={({item})=> <FileRow item={item} onPress={openItem} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { padding:12, borderBottomWidth:1, borderColor:'#eee' },
  name: { fontSize:16 },
  meta: { fontSize:12, color:'#666' },
  header: { padding:12, borderBottomWidth:1, borderColor:'#ddd' },
  headerText: { fontSize:12, color:'#333' },
  pickBtn: { marginTop:8 }
});
