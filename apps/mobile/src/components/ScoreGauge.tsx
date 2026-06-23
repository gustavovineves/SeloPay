import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface Props {
  score: number;
}

function getConfig(visual: number) {
  if (visual < 300)
    return {
      color: Colors.error,
      bgColor: Colors.errorLight,
      label: 'Ruim',
      message: 'Seu histórico ainda indica alto risco em acordos.',
    };
  if (visual < 550)
    return {
      color: Colors.warning,
      bgColor: Colors.warningLight,
      label: 'Baixo',
      message: 'Você ainda precisa construir mais confiança na plataforma.',
    };
  if (visual < 750)
    return {
      color: Colors.primaryLight,
      bgColor: '#E8F4F7',
      label: 'Bom',
      message: 'Você tem um histórico positivo de cumprimento.',
    };
  return {
    color: Colors.success,
    bgColor: Colors.successLight,
    label: 'Ótimo',
    message: 'Você demonstra alta confiabilidade nos acordos.',
  };
}

// Score visual: clamp(score * 7, 0, 1000)
// Exemplo: score=110 → 770 (Ótimo)
export function ScoreGauge({ score }: Props) {
  const scoreVisual = Math.max(0, Math.min(Math.round(score * 7), 1000));
  const config = getConfig(scoreVisual);
  const fillPercent = scoreVisual / 1000;
  const [barWidth, setBarWidth] = useState(0);

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      {/* Ring com número */}
      <View style={[styles.ring, { borderColor: config.color }]}>
        <Text style={[styles.scoreNumber, { color: config.color }]}>{scoreVisual}</Text>
        <Text style={styles.scoreMax}>de 1000</Text>
      </View>

      {/* Badge de classificação */}
      <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
      </View>

      {/* Barra de progresso com zonas */}
      <View style={styles.progressSection}>
        {/* Rótulos alinhados com o flex de cada zona */}
        <View style={styles.zoneLabels}>
          <Text style={[styles.zoneLabel, { flex: 30, color: Colors.error }]}>Ruim</Text>
          <Text style={[styles.zoneLabel, { flex: 25, color: Colors.warning }]}>Baixo</Text>
          <Text style={[styles.zoneLabel, { flex: 20, color: Colors.primaryLight }]}>Bom</Text>
          <Text style={[styles.zoneLabel, { flex: 25, color: Colors.success }]}>Ótimo</Text>
        </View>

        {/* Track + indicador */}
        <View>
          <View style={styles.track} onLayout={onBarLayout}>
            <View style={{ flex: 30, backgroundColor: '#FFCDD2' }} />
            <View style={{ flex: 25, backgroundColor: '#FFE0B2' }} />
            <View style={{ flex: 20, backgroundColor: '#B3E5FC' }} />
            <View style={{ flex: 25, backgroundColor: '#C8E6C9' }} />
          </View>

          {barWidth > 0 && (
            <View
              style={[
                styles.indicator,
                { left: fillPercent * barWidth - 7, borderColor: config.color },
              ]}
            />
          )}
        </View>

        {/* Extremos da escala */}
        <View style={styles.rangeRow}>
          <Text style={styles.rangeNum}>0</Text>
          <Text style={styles.rangeNum}>1000</Text>
        </View>
      </View>

      {/* Mensagem da faixa */}
      <Text style={[styles.message, { color: config.color }]}>{config.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  ring: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: Typography.fontWeightExtraBold,
    lineHeight: 54,
  },
  scoreMax: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textLight,
    fontWeight: Typography.fontWeightMedium,
  },
  badge: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 0.5,
  },
  progressSection: {
    width: '100%',
    marginTop: Spacing.xxl,
  },
  zoneLabels: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  zoneLabel: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightSemiBold,
    textAlign: 'center',
  },
  track: {
    flexDirection: 'row',
    height: 14,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 22,
    borderRadius: 7,
    backgroundColor: Colors.surface,
    borderWidth: 3,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  rangeNum: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textLight,
  },
  message: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
});
