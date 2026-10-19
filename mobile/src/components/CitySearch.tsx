import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { layout, radius, spacing, typography } from '@/styles/tokens';
import type { WeatherTheme } from '@/styles/themes';

type Props = {
  disabled: boolean;
  onSearch: (city: string) => void;
  onUseCurrentLocation: () => void;
  theme: WeatherTheme;
  value: string;
};

export function CitySearch({ disabled, onSearch, onUseCurrentLocation, theme, value }: Props) {
  const [query, setQuery] = useState(value);

  const submit = () => {
    const normalized = query.trim();
    if (!disabled && normalized) {
      onSearch(normalized);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.label, { color: theme.text }]}>Buscar cidade</Text>
      <View style={styles.searchRow}>
        <TextInput
          accessibilityHint="Digite uma cidade e toque em Buscar"
          accessibilityLabel="Digite o nome de uma cidade"
          editable={!disabled}
          onChangeText={setQuery}
          onSubmitEditing={submit}
          placeholder="Ex.: São Paulo"
          placeholderTextColor={theme.muted}
          returnKeyType="search"
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={query}
        />
        <Pressable
          accessibilityLabel="Buscar clima da cidade"
          accessibilityRole="button"
          disabled={disabled || !query.trim()}
          onPress={submit}
          style={[
            styles.searchButton,
            {
              backgroundColor: theme.accent,
              opacity: disabled || !query.trim() ? 0.55 : 1,
            },
          ]}
        >
          <Text style={[styles.searchLabel, { color: theme.card }]}>Buscar</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onUseCurrentLocation}
        style={styles.locationButton}
      >
        <Text style={[styles.locationLabel, { color: theme.accent }]}>Usar minha localização</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.control,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: layout.touchTarget,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
  },
  searchButton: {
    minWidth: 84,
    height: layout.touchTarget,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchLabel: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  locationButton: {
    alignSelf: 'flex-start',
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  locationLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
