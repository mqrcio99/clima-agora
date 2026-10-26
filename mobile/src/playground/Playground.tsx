import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { WeatherCondition } from '@/types/weather';
import { layout, radius, spacing, typography } from '@/styles/tokens';
import type { WeatherTheme } from '@/styles/themes';

const CONDITIONS: { key: WeatherCondition; label: string }[] = [
  { key: 'clear', label: 'Ensolarado' },
  { key: 'rain', label: 'Chuva' },
  { key: 'cold', label: 'Frio' },
  { key: 'snow', label: 'Neve' },
  { key: 'cloudy', label: 'Nublado' },
  { key: 'night', label: 'Noite' },
  { key: 'storm', label: 'Tempestade' },
];

type Props = {
  animationsEnabled: boolean;
  condition: WeatherCondition | null;
  onAnimationToggle: () => void;
  onConditionChange: (condition: WeatherCondition | null) => void;
  theme: WeatherTheme;
};

export function Playground({
  animationsEnabled,
  condition,
  onAnimationToggle,
  onConditionChange,
  theme,
}: Props) {
  return (
    <View
      accessibilityLabel="Playground de clima"
      style={[styles.container, { backgroundColor: theme.card }]}
    >
      <View style={styles.heading}>
        <Text style={[styles.title, { color: theme.text }]}>Playground · DEV</Text>
        <Text style={[styles.description, { color: theme.muted }]}>
          Teste os sete temas e controle as animações de fundo.
        </Text>
      </View>
      <View style={styles.conditions}>
        {CONDITIONS.map((item) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: condition === item.key }}
            key={item.key}
            onPress={() => onConditionChange(item.key)}
            style={[
              styles.conditionButton,
              {
                borderColor: condition === item.key ? theme.accent : theme.border,
                backgroundColor: condition === item.key ? `${theme.accent}24` : 'transparent',
              },
            ]}
          >
            <Text style={[styles.conditionLabel, { color: theme.text }]}>{item.label}</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: condition === null }}
          onPress={() => onConditionChange(null)}
          style={[
            styles.conditionButton,
            {
              borderColor: condition === null ? theme.accent : theme.border,
              backgroundColor: condition === null ? `${theme.accent}24` : 'transparent',
            },
          ]}
        >
          <Text style={[styles.conditionLabel, { color: theme.text }]}>Clima real</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityLabel="Ativar ou desativar animações de fundo"
        accessibilityRole="switch"
        accessibilityState={{ checked: animationsEnabled }}
        onPress={onAnimationToggle}
        style={[styles.animationToggle, { borderColor: theme.border }]}
      >
        <Text style={[styles.conditionLabel, { color: theme.text }]}>
          Animações {animationsEnabled ? 'ativadas' : 'desativadas'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.control,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  heading: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  description: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  conditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  conditionButton: {
    minHeight: layout.touchTarget,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  conditionLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  animationToggle: {
    minHeight: layout.touchTarget,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    justifyContent: 'center',
  },
});
