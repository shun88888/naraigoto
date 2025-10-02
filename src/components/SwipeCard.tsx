import React, { useRef } from 'react';
import { View, Text, Dimensions, Animated, PanResponder, TouchableWithoutFeedback, Image } from 'react-native';
import { UICard } from './ui/Card';
import { colors } from '../lib/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 180;

export type SwipeItem = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  category?: string;
  type?: string;
  genre?: string;
  method?: string;
  price?: number;
  location?: string;
  min_age?: number;
  max_age?: number;
  school_name?: string;
  school_icon?: string;
};

type Props = {
  data: SwipeItem[];
  index: number;
  onSwipeLeft: (item: SwipeItem) => void;
  onSwipeRight: (item: SwipeItem) => void;
  onPressItem?: (item: SwipeItem) => void;
};

export function SwipeDeck({ data, index, onSwipeLeft, onSwipeRight, onPressItem }: Props) {
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_evt, gesture) => {
        // Tap detection: very small movement considered as tap
        const absDx = Math.abs(gesture.dx);
        const absDy = Math.abs(gesture.dy);
        const currentItem = data.length ? data[index % data.length] : undefined;
        if (absDx < 8 && absDy < 8 && currentItem) {
          onPressItem && onPressItem(currentItem);
          resetPosition();
          return;
        }

        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    const item = data[index % data.length];
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    position.setValue({ x: 0, y: 0 });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false
    }).start();
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-20deg', '0deg', '20deg']
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const item = data.length ? data[index % data.length] : undefined;

  if (!item) return null;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: SCREEN_WIDTH - 20,
            height: 520,
            transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }]
          }
        ]}
      >
        <View
          {...panResponder.panHandlers}
          style={{
            height: '100%',
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#000',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8
          }}>
            {/* Main background image area */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#1a1a1a',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Gradient overlay */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)'
              }} />

              {/* Image or placeholder */}
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover'
                  }}
                />
              ) : (
                <View style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#2a2a2a',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', opacity: 0.5 }}>
                    {item.category || '体験'}
                  </Text>
                </View>
              )}
            </View>

            {/* Top tags */}
            <View style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              zIndex: 10
            }}>
              {/* Left side tags */}
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap', flex: 1, marginRight: 12 }}>
                {/* Experience type tag */}
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: 'rgba(255,212,0,0.9)',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.1)'
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: '#000'
                  }}>
                    {item.type || '体験'}
                  </Text>
                </View>

                {/* Category tag */}
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: 'rgba(255,212,0,0.9)',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.1)'
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: '#000'
                  }}>
                    {item.category || '体験'}
                  </Text>
                </View>

                {/* Genre tag */}
                {item.genre && (
                  <View style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: 'rgba(255,212,0,0.9)',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.1)'
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: '#000'
                    }}>
                      {item.genre}
                    </Text>
                  </View>
                )}

                {/* Method tag */}
                {item.method && (
                  <View style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: 'rgba(255,212,0,0.9)',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.1)'
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: '#000'
                    }}>
                      {item.method}
                    </Text>
                  </View>
                )}
              </View>

              {/* Price tag */}
              <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.1)'
              }}>
                <Text style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#000'
                }}>
                  ¥{item.price ? item.price.toLocaleString() : '1,500'}
                </Text>
              </View>
            </View>

            {/* Bottom content overlay */}
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 24,
              paddingBottom: 40,
              backgroundColor: 'rgba(0,0,0,0.8)'
            }}>
              <Text style={{
                fontSize: 30,
                fontWeight: '800',
                color: '#FFFFFF',
                marginBottom: 8,
                lineHeight: 36
              }}>
                {item.title}
              </Text>

              {/* Description */}
              {item.description && (
                <Text style={{
                  fontSize: 16,
                  color: '#CCCCCC',
                  lineHeight: 22,
                  opacity: 0.9,
                  marginBottom: 12
                }}>
                  {item.description}
                </Text>
              )}

              {/* School information */}
              {item.school_name && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#444',
                    overflow: 'hidden'
                  }}>
                    {item.school_icon ? (
                      <Image
                        source={{ uri: item.school_icon }}
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#FFD400',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#000' }}>
                          {item.school_name.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{
                    fontSize: 16,
                    color: '#CCCCCC',
                    opacity: 0.9
                  }}>
                    {item.school_name}
                  </Text>
                </View>
              )}

              {/* Additional info row */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {/* Location */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: '#AAAAAA', borderRadius: 6 }} />
                    <Text style={{
                      fontSize: 14,
                      color: '#AAAAAA',
                      fontWeight: '500'
                    }}>
                      {item.location || '渋谷'}
                    </Text>
                  </View>

                  {/* Age range */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{
                      width: 12,
                      height: 12,
                      backgroundColor: '#AAAAAA',
                      borderRadius: 2,
                      borderWidth: 1,
                      borderColor: '#AAAAAA'
                    }} />
                    <Text style={{
                      fontSize: 14,
                      color: '#AAAAAA',
                      fontWeight: '500'
                    }}>
                      {item.min_age || 5}-{item.max_age || 12}歳
                    </Text>
                  </View>
                </View>

                {/* Duration */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: '#AAAAAA',
                    backgroundColor: 'transparent'
                  }} />
                  <Text style={{
                    fontSize: 14,
                    color: '#AAAAAA',
                    fontWeight: '500'
                  }}>
                    60分
                  </Text>
                </View>
              </View>
            </View>

            {/* NOPE Label */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 40,
                left: 30,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderWidth: 4,
                borderColor: '#FF4757',
                borderRadius: 8,
                backgroundColor: 'transparent',
                opacity: nopeOpacity,
                transform: [{ rotate: '-15deg' }]
              }}
            >
              <Text style={{
                color: '#FF4757',
                fontWeight: '900',
                fontSize: 18,
                letterSpacing: 2
              }}>
                NOPE
              </Text>
            </Animated.View>

            {/* LIKE Label */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 40,
                right: 30,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderWidth: 4,
                borderColor: '#2ED573',
                borderRadius: 8,
                backgroundColor: 'transparent',
                opacity: likeOpacity,
                transform: [{ rotate: '15deg' }]
              }}
            >
              <Text style={{
                color: '#2ED573',
                fontWeight: '900',
                fontSize: 18,
                letterSpacing: 2
              }}>
                LIKE
              </Text>
            </Animated.View>

            {/* Tap to view details overlay */}
            <TouchableWithoutFeedback onPress={() => onPressItem && onPressItem(item)}>
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1
              }} />
            </TouchableWithoutFeedback>
          </View>
      </Animated.View>
    </View>
  );
}


