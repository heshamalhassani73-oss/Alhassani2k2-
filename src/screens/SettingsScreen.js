import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import i18n from '../i18n';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('settings')}</Text>
      <Text style={{marginTop:8}}>هنا إعدادات التطبيق: اللغة، استثناءات المجلدات، كلمات المرور، والسلة. القالب يوضح أماكن الربط بهذه الميزات.</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container:{flex:1, padding:16}, title:{fontSize:20, fontWeight:'700'} });
