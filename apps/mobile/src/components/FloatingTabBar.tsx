import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Colors, Typography } from '../theme';

interface Route {
  key: string;
  name: string;
}

interface Props {
  state: {
    routes: Route[];
    index: number;
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tabBarLabel?: string | ((props: any) => React.ReactNode);
        tabBarIcon?: (args: {
          color: string;
          size: number;
          focused: boolean;
        }) => React.ReactNode;
      };
    }
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
}

export function FloatingTabBar({ state, descriptors, navigation }: Props) {
  const { width } = useWindowDimensions();
  const barWidth = Math.min(width - 72, 340);
  const barLeft = (width - barWidth) / 2;

  return (
    // Container transparente que preenche a tela sem capturar toques
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={[styles.bar, { width: barWidth, left: barLeft }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const color = isFocused ? Colors.primary : Colors.textLight;
          const rawLabel = options.tabBarLabel;
          const label = typeof rawLabel === 'string' ? rawLabel : (options.title ?? route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              {options.tabBarIcon?.({ color, size: 22, focused: isFocused })}
              <Text style={[styles.label, { color }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 28,
    height: 64,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  label: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightMedium,
  },
});
