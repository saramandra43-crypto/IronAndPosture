import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setSetting } from '@/src/db/database';
import { useIronStore } from '@/src/store/useIronStore';
import type { PelvicTilt } from '@/src/types';

const options: { id: PelvicTilt; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'anterior', title: '전방경사', desc: '허리가 과하게 꺾이고 골반이 앞으로 기울어지는 편', icon: 'arrow-forward-circle-outline' },
  { id: 'posterior', title: '후방경사', desc: '골반이 뒤로 말리고 허리의 자연스러운 곡선이 줄어드는 편', icon: 'arrow-back-circle-outline' },
  { id: 'neutral', title: '잘 모르겠음', desc: '중립 모드로 시작하고 성장 탭에서 언제든 변경', icon: 'help-circle-outline' },
];

export default function Onboarding() {
  const db = useSQLiteContext();
  const selected = useIronStore((s) => s.settings.pelvicTilt);
  const setPelvicTilt = useIronStore((s) => s.setPelvicTilt);
  const complete = useIronStore((s) => s.completeOnboarding);

  async function next() {
    if (!selected) return;
    await Promise.all([
      setSetting(db, 'pelvicTilt', selected),
      setSetting(db, 'onboarded', '1'),
      setSetting(db, 'interlockMode', 'soft'),
    ]);
    complete();
    router.replace('/(tabs)/correction');
  }

  return (
    <SafeAreaView className="flex-1 bg-iron-bg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 40 }}>
        <Text className="text-xs font-black tracking-[4px] text-iron-orange">IRON & POSTURE</Text>
        <Text className="mt-4 text-4xl font-black leading-[44px] text-white">먼저, 골반 상태를{`\n`}설정하자.</Text>
        <Text className="mt-4 text-base leading-6 text-zinc-400">이 선택이 교정 루틴과 스쿼트·데드리프트 전 준비운동에 반영돼.</Text>

        <View className="mt-9 gap-4">
          {options.map((option) => {
            const active = selected === option.id;
            return (
              <Pressable key={option.id} onPress={() => setPelvicTilt(option.id)} className={`rounded-[26px] border p-5 ${active ? 'border-iron-orange bg-[#26150f]' : 'border-iron-line bg-iron-card'}`}>
                <View className="flex-row items-center gap-4">
                  <View className={`h-14 w-14 items-center justify-center rounded-2xl ${active ? 'bg-iron-orange' : 'bg-zinc-800'}`}>
                    <Ionicons name={option.icon} size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-black text-white">{option.title}</Text>
                    <Text className="mt-1 leading-5 text-zinc-400">{option.desc}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable disabled={!selected} onPress={next} className={`mt-10 rounded-2xl py-5 ${selected ? 'bg-iron-orange' : 'bg-zinc-800'}`}>
          <Text className={`text-center text-base font-black ${selected ? 'text-white' : 'text-zinc-600'}`}>IRON&POSTURE 시작</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
