import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AlertCondition } from '@/features/alerts/domain/entities/Alert';
import { useCreateAlert } from '@/features/alerts/presentation/hooks/useAlerts';
import { useAssets } from '@/features/market/presentation/hooks/useMarket';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { StateView } from '@/shared/components/StateView';
import { strings } from '@/shared/constants/strings';

export function CreateAlertScreen() {
  const params = useLocalSearchParams<{ assetId?: string }>();
  const { colors } = useAppTheme();
  const assets = useAssets();
  const create = useCreateAlert();
  const [assetId, setAssetId] = useState(params.assetId ?? '');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [target, setTarget] = useState('');

  if (assets.isLoading) return <StateView loading />;
  if (assets.isError)
    return (
      <StateView
        message={assets.error.message}
        onRetry={() => assets.refetch()}
      />
    );

  const submit = () =>
    create.mutate(
      { assetId, type: 'price_target', condition, targetValue: Number(target) },
      { onSuccess: () => router.back() },
    );

  return (
    <Screen>
      <AppText variant="title">{strings.alerts.create}</AppText>
      <AppText variant="heading">{strings.alerts.asset}</AppText>
      <View style={styles.options}>
        {assets.data?.map((asset) => (
          <Pressable
            accessibilityLabel={asset.symbol}
            accessibilityRole="button"
            accessibilityState={{ selected: assetId === asset.id }}
            key={asset.id}
            onPress={() => setAssetId(asset.id)}
            style={[
              styles.option,
              {
                backgroundColor:
                  assetId === asset.id ? colors.primary : colors.surfaceRaised,
                borderColor: colors.border,
              },
            ]}
          >
            <AppText
              style={{
                color: assetId === asset.id ? colors.onPrimary : colors.text,
              }}
            >
              {asset.symbol}
            </AppText>
          </Pressable>
        ))}
      </View>
      <AppText variant="heading">{strings.alerts.condition}</AppText>
      <View style={styles.options}>
        {(['above', 'below'] as AlertCondition[]).map((value) => {
          const label =
            value === 'above' ? strings.alerts.above : strings.alerts.below;
          return (
            <Pressable
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{ selected: condition === value }}
              key={value}
              onPress={() => setCondition(value)}
              style={[
                styles.option,
                {
                  backgroundColor:
                    condition === value ? colors.primary : colors.surfaceRaised,
                  borderColor: colors.border,
                },
              ]}
            >
              <AppText
                style={{
                  color: condition === value ? colors.onPrimary : colors.text,
                }}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <AppInput
        label={strings.alerts.target}
        keyboardType="decimal-pad"
        value={target}
        onChangeText={setTarget}
      />
      {create.error ? (
        <AppText style={{ color: colors.error }}>
          {create.error.message}
        </AppText>
      ) : null}
      <AppButton
        label={strings.common.create}
        onPress={submit}
        loading={create.isPending}
        disabled={!assetId || !target}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
});
