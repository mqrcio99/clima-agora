import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { HourlyForecast } from '@/components/HourlyForecast';
import type { WeatherCondition, WeatherForecast } from '@/types/weather';
import { getWeatherAlerts } from '@/utils/alerts';
import { WEATHER_CONDITION_ICONS, WEATHER_CONDITION_LABELS } from '@/utils/weatherPresentation';
import { layout, radius, spacing, typography } from '@/styles/tokens';
import type { WeatherTheme } from '@/styles/themes';

type Props = {
  city?: string;
  condition: WeatherCondition;
  error?: string | null;
  forecast?: WeatherForecast | null;
  loading: boolean;
  now: Date;
  onRetry?: () => void;
  theme: WeatherTheme;
};

function formatTime(value?: string): string {
  return value ? value.slice(11, 16) : '—';
}

function StatusCard({
  error,
  loading,
  onRetry,
  theme,
}: Pick<Props, 'error' | 'loading' | 'onRetry' | 'theme'>) {
  if (loading) {
    return (
      <View
        accessibilityLabel="Carregando previsão"
        accessibilityRole="progressbar"
        style={[styles.statusCard, { backgroundColor: theme.card }]}
      >
        <ActivityIndicator color={theme.accent} />
        <Text style={[styles.statusText, { color: theme.text }]}>Carregando previsão...</Text>
      </View>
    );
  }

  return (
    <View accessibilityRole="alert" style={[styles.statusCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.statusTitle, { color: theme.text }]}>
        Não foi possível carregar o clima
      </Text>
      <Text style={[styles.bodyText, { color: theme.muted }]}>
        {error || 'Verifique sua conexão e tente novamente.'}
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.retryLabel, { color: theme.card }]}>Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function WeatherCard({
  city,
  condition,
  error,
  forecast,
  loading,
  now,
  onRetry,
  theme,
}: Props) {
  if (!forecast && (loading || error)) {
    return <StatusCard error={error} loading={loading} onRetry={onRetry} theme={theme} />;
  }

  if (!forecast) {
    return (
      <StatusCard
        error="Nenhuma previsão está disponível."
        loading={false}
        onRetry={onRetry}
        theme={theme}
      />
    );
  }

  const { current, daily } = forecast;
  const alert = getWeatherAlerts(forecast)[0];

  return (
    <View
      accessibilityLabel={`Previsão do tempo para ${city || 'sua localização'}`}
      style={[styles.card, { backgroundColor: theme.card }]}
    >
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={[styles.eyebrow, { color: theme.muted }]}>Previsão do tempo</Text>
          <Text accessibilityRole="header" style={[styles.city, { color: theme.text }]}>
            {city || 'Sua localização'}
          </Text>
        </View>
        <Text accessibilityLabel={WEATHER_CONDITION_LABELS[condition]} style={styles.conditionIcon}>
          {WEATHER_CONDITION_ICONS[condition]}
        </Text>
      </View>

      {alert ? (
        <View
          accessibilityRole="summary"
          style={[
            styles.alert,
            { borderColor: theme.border, backgroundColor: `${theme.accent}18` },
          ]}
        >
          <Text style={styles.alertIcon}>{alert.icon}</Text>
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: theme.text }]}>{alert.title}</Text>
            <Text style={[styles.alertDescription, { color: theme.muted }]}>
              {alert.description}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.temperatureRow}>
        <View>
          <Text
            accessibilityLabel={`Temperatura ${Math.round(current.temperature_2m)} graus`}
            style={[styles.temperature, { color: theme.text }]}
          >
            {Math.round(current.temperature_2m)}°
          </Text>
          <Text style={[styles.conditionLabel, { color: theme.muted }]}>
            {WEATHER_CONDITION_LABELS[condition]}
          </Text>
        </View>
        <Text style={[styles.feelsLike, { color: theme.muted }]}>
          Sensação {Math.round(current.apparent_temperature)}°
        </Text>
      </View>

      <HourlyForecast
        daily={daily}
        hourly={forecast.hourly}
        now={now}
        theme={theme}
        timezone={forecast.timezone}
      />

      <View accessibilityLabel="Métricas do clima" style={styles.metrics}>
        <Metric
          label="Umidade"
          value={`${Math.round(current.relative_humidity_2m)}%`}
          theme={theme}
        />
        <Metric label="Vento" value={`${Math.round(current.wind_speed_10m)} km/h`} theme={theme} />
        <Metric
          label="Mínima"
          value={`${Math.round(daily.temperature_2m_min[0] ?? 0)}°`}
          theme={theme}
        />
        <Metric
          label="Máxima"
          value={`${Math.round(daily.temperature_2m_max[0] ?? 0)}°`}
          theme={theme}
        />
        <Metric label="Nascer do sol" value={formatTime(daily.sunrise[0])} theme={theme} />
        <Metric label="Pôr do sol" value={formatTime(daily.sunset[0])} theme={theme} />
        <Metric label="Índice UV" value={`${Math.round(current.uv_index)}`} theme={theme} />
        <Metric
          label="Chance de chuva"
          value={`${Math.round(daily.precipitation_probability_max[0] ?? 0)}%`}
          theme={theme}
        />
      </View>

      {alert ? (
        <Text style={[styles.disclaimer, { color: theme.muted }]}>
          Avisos locais não substituem alertas oficiais.
        </Text>
      ) : null}
      {loading || error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.refreshStatus, { color: theme.muted }]}
        >
          {loading ? 'Atualizando previsão...' : `Não foi possível atualizar: ${error}`}
        </Text>
      ) : null}
    </View>
  );
}

function Metric({ label, value, theme }: { label: string; value: string; theme: WeatherTheme }) {
  return (
    <View style={[styles.metric, { borderColor: theme.border }]}>
      <Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: spacing.xl,
    width: '100%',
  },
  statusCard: {
    borderRadius: radius.card,
    padding: spacing.xxl,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  statusTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  bodyText: {
    fontSize: typography.body,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: layout.touchTarget,
    minWidth: 160,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryLabel: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingText: {
    flexShrink: 1,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  city: {
    fontSize: typography.title,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  conditionIcon: {
    fontSize: 40,
    marginLeft: spacing.md,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  alertIcon: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  alertDescription: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  temperature: {
    fontSize: typography.temperature,
    fontWeight: '300',
    letterSpacing: -3,
  },
  conditionLabel: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  feelsLike: {
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    rowGap: spacing.sm,
  },
  metric: {
    width: '48%',
    minHeight: 68,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: typography.eyebrow,
  },
  metricValue: {
    fontSize: typography.body,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  disclaimer: {
    fontSize: typography.eyebrow,
    marginTop: spacing.md,
  },
  refreshStatus: {
    fontSize: typography.eyebrow,
    marginTop: spacing.md,
  },
});
