import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { BASE_URL } from '../api/config';

const { width } = Dimensions.get('window');

export default function VideoPlayerScreen({ route }: any) {
  const { video } = route.params;
  const [status, setStatus] = useState<any>({});
  const videoRef = React.useRef<Video>(null);

  const videoUri = `${BASE_URL}/uploads/videos/${video.filename}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{video.title}</Text>

      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoUri }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onPlaybackStatusUpdate={s => setStatus(s)}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => {
            if (status.isPlaying) videoRef.current?.pauseAsync();
            else videoRef.current?.playAsync();
          }}
        >
          <Text style={styles.ctrlText}>{status.isPlaying ? '⏸ إيقاف' : '▶ تشغيل'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => videoRef.current?.setPositionAsync(0)}
        >
          <Text style={styles.ctrlText}>⏮ من البداية</Text>
        </TouchableOpacity>
      </View>

      {status.isLoaded && (
        <Text style={styles.timeInfo}>
          {Math.floor((status.positionMillis || 0) / 1000)} ث / {Math.floor((status.durationMillis || 0) / 1000)} ث
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', padding: 16 },
  video: { width, height: width * 9 / 16, backgroundColor: '#000' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 16, padding: 16 },
  ctrlBtn: { backgroundColor: '#1a73e8', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  ctrlText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  timeInfo: { color: '#ccc', textAlign: 'center', fontSize: 14 },
});
