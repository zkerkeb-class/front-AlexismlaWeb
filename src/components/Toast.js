import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Toast = ({ visible, message, type = 'success', onClose, duration = 3000 }) => {
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  console.log("🍞 Toast Component - Props:", { visible, message, type });

  useEffect(() => {
    console.log("🍞 Toast - useEffect triggered, visible:", visible);
    if (visible) {
      console.log("🍞 Toast - Starting animation");
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-fermeture
      const timer = setTimeout(() => {
        console.log("🍞 Toast - Auto-close timer");
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10B981',
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          backgroundColor: '#EF4444',
          icon: 'close-circle',
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B',
          icon: 'warning',
        };
      case 'info':
        return {
          backgroundColor: '#3B82F6',
          icon: 'information-circle',
        };
      default:
        return {
          backgroundColor: '#6B7280',
          icon: 'information-circle',
        };
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) {
    console.log("🍞 Toast - Not visible, returning null");
    return null;
  }

  console.log("🍞 Toast - Rendering with message:", message);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={[styles.toast, { backgroundColor: toastStyle.backgroundColor }]}>
          <View style={styles.content}>
            <Ionicons 
              name={toastStyle.icon} 
              size={24} 
              color="#FFFFFF" 
              style={styles.icon}
            />
            <Text style={styles.message}>
              {message}
            </Text>
            <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    pointerEvents: 'box-none',
  },
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 99999,
  },
  toast: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 60,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Toast; 