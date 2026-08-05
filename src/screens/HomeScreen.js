import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import i18n from '../i18n';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('appName')}</Text>
      <View style={styles.buttons}>
        <Button title={i18n.t('files')} onPress={() => navigation.navigate('Browser')} />
        <View style={{height:10}} />
        <Button title={i18n.t('cleaner')} onPress={() => navigation.navigate('Cleaner')} />
        <View style={{height:10}} />
        <Button title={i18n.t('settings')} onPress={() => navigation.navigate('Settings')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:'center', justifyContent:'center', padding:16 },
  title: { fontSize:22, fontWeight:'700', marginBottom:20 },
  buttons: { width:'100%', maxWidth:400 }
});
