import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const DISMISSED_KEY = '@money_manager_install_banner_dismissed';

export default function InstallBanner() {
  const colors = useColors();
  const { isInstallable, install } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web' || !isInstallable) return;
    AsyncStorage.getItem(DISMISSED_KEY).then((val) => {
      if (val !== 'true') {
        setVisible(true);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [isInstallable]);

  const dismiss = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
    AsyncStorage.setItem(DISMISSED_KEY, 'true');
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) dismiss();
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: '#1A237E', opacity }]}>
      <View style={styles.icon}>
        <Feather name="download" size={18} color="#fff" />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Install Money Manager</Text>
        <Text style={styles.subtitle}>Add to home screen for quick access</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.installBtn, { opacity: pressed ? 0.8 : 1 }]}
        onPress={handleInstall}
      >
        <Text style={styles.installBtnText}>Install</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
        onPress={dismiss}
      >
        <Feather name="x" size={16} color="rgba(255,255,255,0.7)" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  subtitle: { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  installBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  installBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
