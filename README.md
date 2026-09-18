# Iron&Posture v1.0

체형 교정 PREP/RECOVER와 하드 웨이트 로그를 한 세션 흐름으로 묶은 React Native / Expo 앱입니다.

## 포함 기능

1. 전방경사 / 후방경사 / 중립 프로필 선택 및 SQLite 영구 저장
2. PREP / RECOVER 교정 루틴 분리
3. 시간형 스트레칭 카운트다운 + 반복형 활성화 운동 세트 진행
4. 3분할 / 4분할 / 5분할 / PPL / 5x5 프리셋
5. KG / REPS / RPE 기록
6. NORMAL / DROP / SUPER / DESC 세트 태깅
7. 스쿼트·데드리프트·벤치·OHP·로우 Posture Interlock
8. Soft / Hard Interlock 설정
9. 종목별 지난 기록 비교 및 Progressive Overload 표시
10. Epley 예상 1RM 및 세트 볼륨 집계
11. 자동 휴식 타이머
12. Android/iOS 로컬 휴식 종료 알림
13. SQLite 웨이트/교정 로그 저장
14. 최근 7일 볼륨 그래프, 운동 일수, 교정 실행률, 종목별 최고 추정 1RM
15. GitHub Actions Android standalone release APK 자동 빌드 (테스트용 debug key 서명)

## 로컬 실행

```bash
npm install
npx expo start
```

## GitHub에서 APK 만들기

1. 이 프로젝트의 **내용물**을 GitHub 저장소 루트에 업로드합니다. (`package.json`이 저장소 최상단에 보여야 합니다.)
2. 저장소의 **Actions** 탭을 엽니다.
3. **Build Android APK** 워크플로를 선택합니다.
4. **Run workflow**를 실행합니다.
5. 작업이 성공하면 아래 **Artifacts**의 `IronAndPosture-APK`를 내려받습니다.
6. 압축 안의 `app-release.apk`를 Android 기기에 설치합니다.

## 앱 사용 순서

1. 첫 실행: 골반 타입 선택
2. 교정 탭 PREP 완료
3. 운동 탭에서 분할/요일 선택
4. 종목별 KG / REPS / RPE / 세트 타입 입력
5. SET 완료 → 자동 휴식 타이머
6. 메인 리프트는 Interlock 준비도 확인
7. 운동 종료·저장
8. 필요하면 교정 탭 RECOVER 진행
9. 성장 탭에서 최근 7일 데이터 확인

## 주의

이 앱의 교정 루틴은 의료 진단을 대신하지 않습니다. 통증, 저림, 근력 저하 같은 증상이 있으면 운동을 중단하고 의료 전문가의 평가를 받으세요.
