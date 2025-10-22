import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface HeartLogoProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

const HeartLogo: React.FC<HeartLogoProps> = ({ 
  size = 64, 
  color = '#4f46e5', // Default purple
  animated = false 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated]);

  const heartScale = size / 180; // Base size was 180

  return (
    <Animated.View
      style={[
        styles.heartContainer,
        {
          width: size,
          height: size,
          transform: animated ? [{ scale: pulseAnim }] : [],
        },
      ]}
    >
      <View style={styles.heart}>
        <View
          style={[
            styles.heartLeft,
            {
              backgroundColor: color,
              transform: [
                { scale: heartScale },
                { rotate: '-45deg' },
              ],
            },
          ]}
        />
        <View
          style={[
            styles.heartRight,
            {
              backgroundColor: color,
              transform: [
                { scale: heartScale },
                { rotate: '45deg' },
              ],
            },
          ]}
        />
        <View
          style={[
            styles.heartBottom,
            {
              backgroundColor: color,
              transform: [
                { scale: heartScale },
                { rotate: '45deg' },
              ],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  heartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    width: 180,
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartLeft: {
    position: 'absolute',
    top: 40,
    left: 50,
    width: 60,
    height: 90,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  heartRight: {
    position: 'absolute',
    top: 40,
    right: 50,
    width: 60,
    height: 90,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  heartBottom: {
    position: 'absolute',
    top: 65,
    width: 60,
    height: 60,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default HeartLogo;
