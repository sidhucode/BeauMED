import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

// Star component for twinkling effect
const Star: React.FC<{ delay: number; x: number; y: number }> = ({ delay, x, y }) => {
  const twinkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          opacity: twinkleAnim,
          transform: [{ scale: twinkleAnim }],
        },
      ]}
    />
  );
};

// Ripple component for radial pulse effect
const Ripple: React.FC<{ delay: number }> = ({ delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

// DNA Helix component
const DNAHelix: React.FC = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Create DNA strand points
  const renderDNAStrands = () => {
    const strands = [];
    for (let i = 0; i < 8; i++) {
      const offset = (i / 8) * Math.PI * 2;
      strands.push(
        <View key={`pair-${i}`} style={styles.dnaPairContainer}>
          <View
            style={[
              styles.dnaPoint,
              {
                left: Math.sin(offset) * 30 + 40,
                top: i * 40,
              },
            ]}
          />
          <View
            style={[
              styles.dnaPoint,
              {
                left: Math.sin(offset + Math.PI) * 30 + 40,
                top: i * 40,
              },
            ]}
          />
          <View
            style={[
              styles.dnaConnection,
              {
                top: i * 40 + 3,
                left: Math.min(
                  Math.sin(offset) * 30 + 40,
                  Math.sin(offset + Math.PI) * 30 + 40
                ),
                width: Math.abs(Math.sin(offset) * 60),
              },
            ]}
          />
        </View>
      );
    }
    return strands;
  };

  return (
    <Animated.View
      style={[
        styles.dnaContainer,
        {
          transform: [{ rotate }],
        },
      ]}
    >
      {renderDNAStrands()}
    </Animated.View>
  );
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play startup sound
    playStartupSound();

    // Sequence of animations
    Animated.sequence([
      // Heart pops up
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Text fades in
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      // Hold for longer to see animations
      Animated.delay(2000),
      // Fade everything out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onFinish();
    });
  }, []);

  const playStartupSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        // Using a built-in notification sound as placeholder
        // You can replace this with a custom sound file later
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 0.3 }
      );
      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Failed to load startup sound:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />
      
      {/* DNA Helix rotating in background */}
      <DNAHelix />
      
      {/* Twinkling stars scattered across screen */}
      <Star delay={0} x={width * 0.1} y={height * 0.15} />
      <Star delay={200} x={width * 0.85} y={height * 0.2} />
      <Star delay={400} x={width * 0.25} y={height * 0.35} />
      <Star delay={600} x={width * 0.75} y={height * 0.45} />
      <Star delay={800} x={width * 0.15} y={height * 0.65} />
      <Star delay={1000} x={width * 0.9} y={height * 0.7} />
      <Star delay={300} x={width * 0.5} y={height * 0.15} />
      <Star delay={700} x={width * 0.6} y={height * 0.8} />
      <Star delay={500} x={width * 0.3} y={height * 0.75} />
      <Star delay={900} x={width * 0.8} y={height * 0.35} />
      
      {/* Heart shape with text */}
      <Animated.View
        style={[
          styles.heartContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Heart SVG-like shape using View components */}
        <View style={styles.heart}>
          <View style={styles.heartLeft} />
          <View style={styles.heartRight} />
          <View style={styles.heartBottom} />
          
          {/* Text inside heart */}
          <Animated.View style={[styles.textContainer, { opacity: textFadeAnim }]}>
            <Text style={styles.text}>BeauMED</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4c1d95', // Deep purple
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4c1d95',
  },
  heartContainer: {
    width: 200,
    height: 200,
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
    top: 30,
    left: 40,
    width: 60,
    height: 90,
    backgroundColor: '#8b5cf6', // Bright purple
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    transform: [{ rotate: '-45deg' }],
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  heartRight: {
    position: 'absolute',
    top: 30,
    right: 40,
    width: 60,
    height: 90,
    backgroundColor: '#8b5cf6', // Bright purple
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  heartBottom: {
    position: 'absolute',
    top: 75,
    width: 60,
    height: 60,
    backgroundColor: '#8b5cf6', // Bright purple
    transform: [{ rotate: '45deg' }],
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    position: 'absolute',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  // DNA Helix
  dnaContainer: {
    position: 'absolute',
    width: 100,
    height: 320,
    left: width * 0.1,
    top: height * 0.3,
    opacity: 0.15,
  },
  dnaPairContainer: {
    position: 'relative',
  },
  dnaPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a78bfa',
  },
  dnaConnection: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#c4b5fd',
    opacity: 0.6,
  },
  // Stars
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#c4b5fd',
    borderRadius: 2,
    shadowColor: '#c4b5fd',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  // Ripples
  rippleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  ripple: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: '#a78bfa',
  },
});

export default SplashScreen;
