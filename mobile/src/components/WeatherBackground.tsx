import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, AppState, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { WeatherCondition } from '@/types/weather';
import type { WeatherTheme } from '@/styles/themes';

type Props = PropsWithChildren<{
  theme: WeatherTheme;
  condition: WeatherCondition;
  animationsEnabled?: boolean;
}>;

type ParticleKind = 'rain' | 'snow' | 'star';

type Particle = {
  x: number;
  y: number;
  size: number;
  drift: number;
  phase: number;
  duration: number;
};

const PARTICLE_COUNT = 14;

function createParticles(kind: ParticleKind, width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    x: Math.random() * width,
    y: kind === 'rain' ? -30 : Math.random() * height,
    size: kind === 'rain' ? 16 + Math.random() * 9 : 2 + Math.random() * 3,
    drift: kind === 'rain' ? -14 + Math.random() * 28 : -16 + Math.random() * 32,
    phase: Math.random() * Math.PI * 2,
    duration:
      kind === 'rain'
        ? 1200 + Math.random() * 1000
        : kind === 'snow'
          ? 4500 + Math.random() * 3500
          : 1800 + index * 110,
  }));
}

function AnimatedParticle({
  enabled,
  height,
  kind,
  particle,
  width,
  color,
}: {
  enabled: boolean;
  height: number;
  kind: ParticleKind;
  particle: Particle;
  width: number;
  color: string;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!enabled) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }

    progress.value = withRepeat(
      withTiming(1, {
        duration: particle.duration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => cancelAnimation(progress);
  }, [enabled, particle.duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (kind === 'star') {
      return {
        opacity: 0.2 + Math.abs(Math.sin(progress.value * Math.PI)) * 0.8,
        transform: [{ scale: 0.75 + progress.value * 0.45 }],
      };
    }

    const verticalRange = kind === 'rain' ? height + 60 : height;
    return {
      transform: [
        { translateX: Math.sin(progress.value * Math.PI * 2 + particle.phase) * particle.drift },
        { translateY: progress.value * verticalRange },
        ...(kind === 'rain' ? [{ rotateZ: '-14deg' }] : []),
      ],
    };
  }, [height, kind, particle]);

  return (
    <Animated.View
      accessible={false}
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: kind === 'rain' ? 2 : particle.size,
          height: kind === 'rain' ? particle.size : particle.size,
          borderRadius: kind === 'rain' ? 2 : particle.size / 2,
          backgroundColor: color,
          opacity: kind === 'rain' ? 0.45 : 0.8,
        },
        animatedStyle,
      ]}
    />
  );
}

function AmbientGlow({ condition, enabled }: { condition: WeatherCondition; enabled: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!enabled) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }

    progress.value = withRepeat(
      withTiming(1, {
        duration: condition === 'storm' ? 3200 : 4800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    return () => cancelAnimation(progress);
  }, [condition, enabled, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: condition === 'storm' ? progress.value * 0.1 : 0.08 + progress.value * 0.12,
    transform: [{ scale: 0.94 + progress.value * 0.12 }],
  }));

  const glowColor =
    condition === 'storm' ? '#FDE68A' : condition === 'cloudy' ? '#FFFFFF' : '#FFD166';

  return (
    <Animated.View
      accessible={false}
      style={[
        styles.glow,
        condition === 'cloudy' ? styles.cloudGlow : styles.sunGlow,
        { backgroundColor: glowColor },
        animatedStyle,
      ]}
    />
  );
}

export function WeatherBackground({ children, theme, condition, animationsEnabled = true }: Props) {
  const { width, height } = useWindowDimensions();
  const [isActive, setIsActive] = useState(AppState.currentState === 'active');
  const [reduceMotion, setReduceMotion] = useState(false);
  const animationIsAllowed = animationsEnabled && isActive && !reduceMotion;
  const particleKind: ParticleKind | null =
    condition === 'rain' || condition === 'storm'
      ? 'rain'
      : condition === 'snow' || condition === 'cold'
        ? 'snow'
        : condition === 'night'
          ? 'star'
          : null;
  const particles = useMemo(
    () => (particleKind ? createParticles(particleKind, width, height) : []),
    [height, particleKind, width],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setIsActive(nextState === 'active');
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    void AccessibilityInfo.isReduceMotionEnabled().then(
      (enabled) => {
        if (mounted) {
          setReduceMotion(enabled);
        }
      },
      (error: unknown) => {
        console.warn('Não foi possível verificar a preferência de movimento reduzido.', error);
        if (mounted) {
          setReduceMotion(true);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const showGlow = condition === 'clear' || condition === 'cloudy' || condition === 'storm';

  return (
    <View style={[styles.container, { backgroundColor: theme.gradientColors[0] }]}>
      <LinearGradient
        accessibilityElementsHidden
        colors={theme.gradientColors}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View accessibilityElementsHidden pointerEvents="none" style={StyleSheet.absoluteFill}>
        {showGlow ? <AmbientGlow condition={condition} enabled={animationIsAllowed} /> : null}
        {particleKind
          ? particles.map((particle, index) => (
              <AnimatedParticle
                color={
                  particleKind === 'star'
                    ? '#F8D66D'
                    : particleKind === 'rain'
                      ? theme.accent
                      : '#FFFFFF'
                }
                enabled={animationIsAllowed}
                height={height}
                key={`${condition}-${index}`}
                kind={particleKind}
                particle={particle}
                width={width}
              />
            ))
          : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  particle: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    top: 30,
    right: -48,
  },
  sunGlow: {
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  cloudGlow: {
    top: 72,
    right: -32,
    width: 250,
    height: 82,
    borderRadius: 48,
  },
});
