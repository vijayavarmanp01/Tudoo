import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, shadows } from '../theme/spacing';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const [scaleAnim] = React.useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const gradientColors =
    variant === 'primary'
      ? (['#A788FA', '#F472B6'] as const)
      : variant === 'secondary'
      ? (['#EDE9FE', '#FCE7F3'] as const)
      : (['#F87171', '#EF4444'] as const);

  const isSecondary = variant === 'secondary';

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, iconSize: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, iconSize: 18 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 17, iconSize: 20 },
  }[size];

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.88}
        style={[
          styles.touchable,
          variant === 'primary' && shadows.button,
          disabled && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={disabled ? ['#D1D5DB', '#9CA3AF'] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            },
            isSecondary && styles.secondaryBorder,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={isSecondary ? '#8B5CF6' : '#FFFFFF'}
            />
          ) : (
            <>
              {icon && (
                <Ionicons
                  name={icon}
                  size={sizeStyles.iconSize}
                  color={isSecondary ? '#7C3AED' : '#FFFFFF'}
                  style={styles.icon}
                />
              )}
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: sizeStyles.fontSize,
                    color: isSecondary ? '#7C3AED' : '#FFFFFF',
                  },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.pill,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.55,
  },
});
