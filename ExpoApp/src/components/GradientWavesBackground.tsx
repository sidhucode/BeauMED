import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const GradientWavesBackground: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Wave 1 - Bottom */}
      <View style={[styles.wave, styles.wave1]}>
        <View style={styles.waveGradient1} />
      </View>
      
      {/* Wave 2 - Middle */}
      <View style={[styles.wave, styles.wave2]}>
        <View style={styles.waveGradient2} />
      </View>
      
      {/* Wave 3 - Top */}
      <View style={[styles.wave, styles.wave3]}>
        <View style={styles.waveGradient3} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#faf5ff', // Very light purple background
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: width * 2,
    height: height * 0.6,
    opacity: 0.12,
  },
  wave1: {
    bottom: -height * 0.2,
    left: -width * 0.3,
    transform: [{ rotate: '-15deg' }],
  },
  wave2: {
    bottom: -height * 0.1,
    right: -width * 0.4,
    transform: [{ rotate: '10deg' }],
  },
  wave3: {
    top: -height * 0.3,
    left: -width * 0.2,
    transform: [{ rotate: '20deg' }],
  },
  waveGradient1: {
    flex: 1,
    backgroundColor: '#8b5cf6', // Purple 500
    borderRadius: width,
  },
  waveGradient2: {
    flex: 1,
    backgroundColor: '#a78bfa', // Purple 400
    borderRadius: width,
  },
  waveGradient3: {
    flex: 1,
    backgroundColor: '#c4b5fd', // Purple 300
    borderRadius: width,
  },
});

export default GradientWavesBackground;
