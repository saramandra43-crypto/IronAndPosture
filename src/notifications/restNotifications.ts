import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let currentNotificationId: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function prepareRestNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: '휴식 타이머',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 150, 250],
    });
  }

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

export async function scheduleRestFinishedNotification(seconds: number) {
  if (currentNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(currentNotificationId).catch(() => undefined);
  }

  currentNotificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'IRON&POSTURE',
      body: '휴식 종료. 다음 세트 갈 시간이야.',
      sound: 'default',
      ...(Platform.OS === 'android' ? { data: { channelId: 'rest-timer' } } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(seconds)),
      ...(Platform.OS === 'android' ? { channelId: 'rest-timer' } : {}),
    },
  });

  return currentNotificationId;
}

export async function cancelRestFinishedNotification() {
  if (!currentNotificationId) return;
  await Notifications.cancelScheduledNotificationAsync(currentNotificationId).catch(() => undefined);
  currentNotificationId = null;
}
