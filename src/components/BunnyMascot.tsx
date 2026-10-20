import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export type BunnyMood =
  | 'happy'
  | 'holding_heart'
  | 'resting'
  | 'celebrating'
  | 'peeking'
  | 'cheering'
  | 'peaceful'
  | 'encouraging';

interface BunnyMascotProps {
  mood?: BunnyMood;
  size?: number;
}

export const BunnyMascot: React.FC<BunnyMascotProps> = ({ mood = 'holding_heart', size = 80 }) => {
  const scale = size / 120;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#F472B6" />
            <Stop offset="100%" stopColor="#EC4899" />
          </LinearGradient>
          <LinearGradient id="earGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FDF2F8" />
            <Stop offset="100%" stopColor="#FBCFE8" />
          </LinearGradient>
          <LinearGradient id="checkGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#34D399" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>
          <LinearGradient id="shadowGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        <G transform={`scale(${scale})`}>
          {/* Ground shadow for upright moods */}
          {mood !== 'peeking' && mood !== 'resting' && (
            <Ellipse cx="60" cy="110" rx="36" ry="6" fill="url(#shadowGrad)" />
          )}

          {/* ================= RESTING MOOD (Empty state) ================= */}
          {mood === 'resting' && (
            <G transform="translate(0, 10)">
              {/* Cozy soft bed / cloud oval */}
              <Ellipse cx="60" cy="98" rx="46" ry="10" fill="#EDE9FE" opacity="0.6" />

              {/* Flowers / leaves on ground */}
              <Circle cx="24" cy="95" r="4" fill="#F472B6" opacity="0.8" />
              <Circle cx="20" cy="93" r="3" fill="#FBCFE8" />
              <Circle cx="28" cy="93" r="3" fill="#FBCFE8" />
              <Circle cx="24" cy="90" r="3" fill="#FBCFE8" />
              <Circle cx="98" cy="94" r="3" fill="#34D399" opacity="0.7" />
              <Circle cx="102" cy="92" r="3.5" fill="#A7F3D0" />

              {/* Body resting on side */}
              <Ellipse cx="64" cy="84" rx="34" ry="22" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2.5" />
              {/* Tail */}
              <Circle cx="98" cy="80" r="7" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" />

              {/* Head turned sideways */}
              <Ellipse cx="46" cy="62" rx="24" ry="20" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2.5" />

              {/* Sleeping Ears relaxed back */}
              <Ellipse cx="30" cy="40" rx="20" ry="7" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2.5" transform="rotate(-25 30 40)" />
              <Ellipse cx="30" cy="40" rx="14" ry="4" fill="url(#earGrad)" transform="rotate(-25 30 40)" />
              <Ellipse cx="42" cy="34" rx="19" ry="6.5" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" transform="rotate(-15 42 34)" />
              <Ellipse cx="42" cy="34" rx="13" ry="3.5" fill="url(#earGrad)" transform="rotate(-15 42 34)" />

              {/* Sleeping Cheeks */}
              <Circle cx="36" cy="68" r="5" fill="#F472B6" opacity="0.4" />
              <Circle cx="56" cy="66" r="4" fill="#F472B6" opacity="0.3" />

              {/* Sleeping Eyes (gentle curves) */}
              <Path d="M 38 60 Q 42 63 46 60" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" fill="none" />
              <Path d="M 52 59 Q 56 62 60 59" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Nose & sweet smile */}
              <Ellipse cx="47" cy="65" rx="1.8" ry="1.4" fill="#F472B6" />
              <Path d="M 45 68 Q 47 70 49 68" stroke="#4C1D95" strokeWidth="1.6" strokeLinecap="round" fill="none" />

              {/* Cute sleeping 'Zzz' */}
              <Path d="M 78 40 L 85 40 L 78 48 L 85 48" stroke="#A788FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <Path d="M 88 28 L 94 28 L 88 35 L 94 35" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </G>
          )}

          {/* ================= PEEKING MOOD ================= */}
          {mood === 'peeking' && (
            <G transform="translate(0, 16)">
              {/* Ears */}
              <Ellipse cx="46" cy="32" rx="9" ry="24" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2.5" transform="rotate(-12 46 32)" />
              <Ellipse cx="46" cy="32" rx="5" ry="16" fill="url(#earGrad)" transform="rotate(-12 46 32)" />
              <Ellipse cx="74" cy="32" rx="9" ry="24" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2.5" transform="rotate(12 74 32)" />
              <Ellipse cx="74" cy="32" rx="5" ry="16" fill="url(#earGrad)" transform="rotate(12 74 32)" />

              {/* Head */}
              <Ellipse cx="60" cy="62" rx="28" ry="24" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2.5" />

              {/* Cheeks */}
              <Circle cx="42" cy="68" r="5.5" fill="#F472B6" opacity="0.45" />
              <Circle cx="78" cy="68" r="5.5" fill="#F472B6" opacity="0.45" />

              {/* Bright inquisitive eyes */}
              <Circle cx="48" cy="58" r="4" fill="#2E1065" />
              <Circle cx="46.5" cy="56.5" r="1.5" fill="#FFFFFF" />
              <Circle cx="49.5" cy="59.5" r="0.7" fill="#FFFFFF" />

              <Circle cx="72" cy="58" r="4" fill="#2E1065" />
              <Circle cx="70.5" cy="56.5" r="1.5" fill="#FFFFFF" />
              <Circle cx="73.5" cy="59.5" r="0.7" fill="#FFFFFF" />

              {/* Nose & mouth */}
              <Ellipse cx="60" cy="64" rx="2" ry="1.5" fill="#F472B6" />
              <Path d="M 57 66 Q 60 69 60 67 M 60 67 Q 60 69 63 66" stroke="#4C1D95" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Little paws holding edge */}
              <Ellipse cx="46" cy="84" rx="6" ry="5" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" />
              <Ellipse cx="74" cy="84" rx="6" ry="5" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" />
            </G>
          )}

          {/* ================= UPRIGHT MOODS (holding_heart, happy, celebrating, cheering, etc.) ================= */}
          {mood !== 'resting' && mood !== 'peeking' && (
            <G>
              {/* Ears */}
              <Ellipse
                cx="44"
                cy="32"
                rx="9.5"
                ry="26"
                fill="#FFFFFF"
                stroke="#E2D9F3"
                strokeWidth="2.5"
                transform={mood === 'celebrating' ? 'rotate(-18 44 32)' : 'rotate(-8 44 32)'}
              />
              <Ellipse
                cx="44"
                cy="32"
                rx="5"
                ry="17"
                fill="url(#earGrad)"
                transform={mood === 'celebrating' ? 'rotate(-18 44 32)' : 'rotate(-8 44 32)'}
              />

              <Ellipse
                cx="76"
                cy="32"
                rx="9.5"
                ry="26"
                fill="#FFFFFF"
                stroke="#E2D9F3"
                strokeWidth="2.5"
                transform={mood === 'celebrating' ? 'rotate(18 76 32)' : 'rotate(8 76 32)'}
              />
              <Ellipse
                cx="76"
                cy="32"
                rx="5"
                ry="17"
                fill="url(#earGrad)"
                transform={mood === 'celebrating' ? 'rotate(18 76 32)' : 'rotate(8 76 32)'}
              />

              {/* Body */}
              <Ellipse cx="60" cy="88" rx="29" ry="21" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2.5" />
              {/* Feet */}
              <Ellipse cx="44" cy="106" rx="8" ry="4" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" />
              <Ellipse cx="76" cy="106" rx="8" ry="4" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" />

              {/* Head */}
              <Ellipse cx="60" cy="62" rx="28" ry="24" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2.5" />

              {/* Rosy Cheeks */}
              <Circle cx="41" cy="67" r="5.5" fill="#F472B6" opacity="0.45" />
              <Circle cx="79" cy="67" r="5.5" fill="#F472B6" opacity="0.45" />

              {/* Nose */}
              <Ellipse cx="60" cy="64" rx="2.2" ry="1.6" fill="#F472B6" />

              {/* Eyes & Mouth per mood */}
              {(mood === 'holding_heart' || mood === 'happy' || mood === 'encouraging') && (
                <G>
                  {/* Big cute anime sparkle eyes */}
                  <Circle cx="47" cy="58" r="4.2" fill="#2E1065" />
                  <Circle cx="45.5" cy="56" r="1.6" fill="#FFFFFF" />
                  <Circle cx="48.5" cy="59.5" r="0.8" fill="#FFFFFF" />

                  <Circle cx="73" cy="58" r="4.2" fill="#2E1065" />
                  <Circle cx="71.5" cy="56" r="1.6" fill="#FFFFFF" />
                  <Circle cx="74.5" cy="59.5" r="0.8" fill="#FFFFFF" />

                  {/* Gentle curved smile */}
                  <Path d="M 57 66 Q 60 69 60 67 M 60 67 Q 60 69 63 66" stroke="#4C1D95" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </G>
              )}

              {(mood === 'celebrating' || mood === 'cheering') && (
                <G>
                  {/* Happy closed arched eyes (smiling widely) */}
                  <Path d="M 43 59 Q 47 53 51 59" stroke="#4C1D95" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <Path d="M 69 59 Q 73 53 77 59" stroke="#4C1D95" strokeWidth="2.6" strokeLinecap="round" fill="none" />

                  {/* Open smiling mouth */}
                  <Path d="M 57 66 Q 60 72 63 66 Z" fill="#F472B6" stroke="#4C1D95" strokeWidth="1.5" />
                </G>
              )}

              {mood === 'peaceful' && (
                <G>
                  <Path d="M 44 58 Q 48 62 52 58" stroke="#4C1D95" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <Path d="M 68 58 Q 72 62 76 58" stroke="#4C1D95" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <Path d="M 57 66 Q 60 69 63 66" stroke="#4C1D95" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </G>
              )}

              {/* Heart holding element (Signature look from mockup!) */}
              {mood === 'holding_heart' && (
                <G transform="translate(60, 84)">
                  {/* Gradient Heart */}
                  <Path
                    d="M 0 -8 C 0 -14 -8 -16 -12 -11 C -16 -6 -12 2 0 10 C 12 2 16 -6 12 -11 C 8 -16 0 -14 0 -8 Z"
                    fill="url(#heartGrad)"
                  />
                  {/* Little glossy highlight on heart */}
                  <Circle cx="-6" cy="-8" r="1.8" fill="#FFFFFF" opacity="0.6" />

                  {/* Bunny paws holding heart */}
                  <Ellipse cx="-9" cy="-2" rx="4.5" ry="3.5" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="1.8" transform="rotate(25 -9 -2)" />
                  <Ellipse cx="9" cy="-2" rx="4.5" ry="3.5" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="1.8" transform="rotate(-25 9 -2)" />
                </G>
              )}

              {/* Normal paws for other moods */}
              {mood !== 'holding_heart' && mood !== 'celebrating' && (
                <G>
                  <Ellipse cx="51" cy="85" rx="5" ry="4" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" />
                  <Ellipse cx="69" cy="85" rx="5" ry="4" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" />
                </G>
              )}

              {/* Celebration / Checkmark and confetti */}
              {mood === 'celebrating' && (
                <G>
                  {/* Green checkmark badge to left */}
                  <G transform="translate(22, 54)">
                    <Circle cx="0" cy="0" r="14" fill="url(#checkGrad)" />
                    <Path d="M -6 -1 L -2 4 L 7 -5" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </G>

                  {/* Confetti sparkles */}
                  <Path d="M 96 28 L 98 32 L 102 32 L 99 35 L 100 39 L 96 36 L 92 39 L 93 35 L 90 32 L 94 32 Z" fill="#FBBF24" />
                  <Path d="M 18 24 L 20 28 L 24 28 L 21 31 L 22 35 L 18 32 L 14 35 L 15 31 L 12 28 L 16 28 Z" fill="#F472B6" />
                  <Circle cx="98" cy="56" r="3" fill="#A788FA" />
                  <Circle cx="104" cy="74" r="2.5" fill="#34D399" />
                  <Rect x="20" y="86" width="4" height="4" rx="1" fill="#F472B6" transform="rotate(30 22 88)" />
                  <Rect x="92" y="94" width="4" height="4" rx="1" fill="#FBBF24" transform="rotate(45 94 96)" />

                  {/* Bunny Raised paws */}
                  <Ellipse cx="46" cy="76" rx="5" ry="4" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" transform="rotate(-30 46 76)" />
                  <Ellipse cx="74" cy="76" rx="5" ry="4" fill="#FFFFFF" stroke="#E2D9F3" strokeWidth="2" transform="rotate(30 74 76)" />
                </G>
              )}
            </G>
          )}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
