import type { CorrectionExercise, PelvicTilt } from '@/src/types';

export const anteriorPreset: CorrectionExercise[] = [
  {
    id: 'apt-pelvis-control', name: '골반 중립 컨트롤', tilt: 'anterior', type: 'mobility',
    targetMuscle: '골반·복부', sets: 2, reps: 8, phase: 'pre',
    cues: ['갈비뼈를 과하게 들지 않는다.', '골반을 앞뒤로 작게 움직인 뒤 중립 위치를 찾는다.'],
  },
  {
    id: 'apt-hip-flexor', name: '하프 니링 장요근 스트레칭', tilt: 'anterior', type: 'stretch',
    targetMuscle: '장요근', sets: 2, durationSeconds: 30, phase: 'both',
    cues: ['허리를 과하게 꺾지 않는다.', '골반을 살짝 후방으로 말아준다.', '앞쪽 고관절의 당김을 유지한다.'],
  },
  {
    id: 'apt-deadbug', name: '데드버그', tilt: 'anterior', type: 'activation',
    targetMuscle: '복부', sets: 2, reps: 10, phase: 'pre',
    cues: ['허리가 바닥에서 뜨지 않게 한다.', '갈비뼈가 들리지 않게 호흡한다.'],
  },
  {
    id: 'apt-glute-bridge', name: '글루트 브리지', tilt: 'anterior', type: 'activation',
    targetMuscle: '대둔근', sets: 2, reps: 15, phase: 'pre',
    cues: ['허리가 아닌 엉덩이로 들어 올린다.', '상단에서 둔근을 수축한다.'],
  },
  {
    id: 'apt-rectus-femoris', name: '대퇴직근 스트레칭', tilt: 'anterior', type: 'stretch',
    targetMuscle: '대퇴직근', sets: 2, durationSeconds: 30, phase: 'post',
    cues: ['복부에 힘을 유지한다.', '허리 과신전을 피한다.'],
  },
];

export const posteriorPreset: CorrectionExercise[] = [
  {
    id: 'ppt-hip-hinge', name: '힙힌지 패턴 리셋', tilt: 'posterior', type: 'mobility',
    targetMuscle: '고관절·척추', sets: 2, reps: 8, phase: 'pre',
    cues: ['허리를 말지 않고 엉덩이를 뒤로 보낸다.', '정강이 각도를 크게 바꾸지 않는다.'],
  },
  {
    id: 'ppt-hamstring', name: '햄스트링 스트레칭', tilt: 'posterior', type: 'stretch',
    targetMuscle: '햄스트링', sets: 2, durationSeconds: 30, phase: 'both',
    cues: ['허리를 둥글게 말지 않는다.', '고관절에서 접히는 느낌으로 움직인다.'],
  },
  {
    id: 'ppt-hip-flexor-march', name: '밴드 힙 플렉서 마치', tilt: 'posterior', type: 'activation',
    targetMuscle: '장요근', sets: 3, reps: 10, phase: 'pre',
    cues: ['몸통을 뒤로 젖히지 않는다.', '고관절 앞쪽 힘으로 무릎을 들어올린다.'],
  },
  {
    id: 'ppt-back-extension', name: '백 익스텐션', tilt: 'posterior', type: 'strength',
    targetMuscle: '척추기립근', sets: 2, reps: 12, phase: 'pre',
    cues: ['과신전하지 않는다.', '척추를 길게 유지한다.'],
  },
  {
    id: 'ppt-split-squat', name: '스플릿 스쿼트', tilt: 'posterior', type: 'strength',
    targetMuscle: '대퇴사두근', sets: 2, reps: 10, phase: 'pre',
    cues: ['앞발 전체로 지면을 누른다.', '골반이 말려 들어가지 않게 범위를 조절한다.'],
  },
  {
    id: 'ppt-glute', name: '대둔근 스트레칭', tilt: 'posterior', type: 'stretch',
    targetMuscle: '대둔근', sets: 2, durationSeconds: 30, phase: 'post',
    cues: ['허리를 과하게 둥글게 만들지 않는다.', '엉덩이 깊은 부위의 당김을 확인한다.'],
  },
];

export const neutralPreset: CorrectionExercise[] = [
  {
    id: 'neutral-90-90', name: '90/90 힙 전환', tilt: 'neutral', type: 'mobility',
    targetMuscle: '고관절', sets: 2, reps: 8, phase: 'pre',
    cues: ['통증 없는 범위에서 천천히 움직인다.', '상체가 과하게 무너지지 않게 한다.'],
  },
  {
    id: 'neutral-deadbug', name: '데드버그', tilt: 'neutral', type: 'activation',
    targetMuscle: '코어', sets: 2, reps: 8, phase: 'pre',
    cues: ['허리와 갈비뼈 위치를 안정적으로 유지한다.', '호흡을 멈추지 않는다.'],
  },
  {
    id: 'neutral-glute-bridge', name: '글루트 브리지', tilt: 'neutral', type: 'activation',
    targetMuscle: '둔근', sets: 2, reps: 12, phase: 'pre',
    cues: ['허리로 밀어 올리지 않는다.', '발 전체로 지면을 누른다.'],
  },
  {
    id: 'neutral-recovery', name: '누운 전신 이완 호흡', tilt: 'neutral', type: 'stretch',
    targetMuscle: '전신', sets: 2, durationSeconds: 40, phase: 'post',
    cues: ['코로 천천히 들이마신다.', '길게 내쉬며 몸의 긴장을 줄인다.'],
  },
];

export function getCorrectionPreset(tilt: PelvicTilt | null) {
  if (tilt === 'anterior') return anteriorPreset;
  if (tilt === 'posterior') return posteriorPreset;
  if (tilt === 'neutral') return neutralPreset;
  return [];
}
