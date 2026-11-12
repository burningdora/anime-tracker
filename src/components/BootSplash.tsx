import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

// Цвет фона совпадает с фоном гифки персонажа (rgb(0, 0, 4)),
// поэтому края изображения не видны и картинка «растворяется» в экране.
const BACKGROUND = '#000004';

// Размеры подобраны под пропорции исходных гифок.
const CHARACTER_WIDTH = 290;
const CHARACTER_HEIGHT = 253;

const INTRO_DURATION = 2400;
const FADE_DURATION = 450;

type Props = {
  onFinish: () => void;
};

export function BootSplash({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      onFinish();
    }

    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION,
        // На web нативного драйвера нет — там анимация идёт через JS.
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished: completed }) => {
        if (completed) finish();
      });
    }, INTRO_DURATION);

    // Страховка: если анимация почему-то не доиграла, экран всё равно уйдёт.
    const failsafe = setTimeout(finish, INTRO_DURATION + FADE_DURATION + 400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(failsafe);
    };
  }, [onFinish, opacity]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]} testID="boot-splash">
      {/* Сцена ровно в высоту персонажа, поэтому персонаж стоит по центру экрана. */}
      <View style={styles.stage} testID="boot-stage">
        <Image
          source={require('../../assets/images/loading-character.gif')}
          style={styles.character}
          contentFit="contain"
          testID="boot-character"
        />

        {/* Название и полоска загрузки прижаты к верху сцены, то есть над персонажем. */}
        <View style={styles.topBlock} pointerEvents="none">
          <Text style={styles.title} testID="boot-title">
            ANIME{'\n'}TRACKER
          </Text>
          <Image
            source={require('../../assets/images/loading-bar.gif')}
            style={styles.loader}
            contentFit="contain"
            testID="boot-loader"
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  stage: {
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  character: { width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT },
  topBlock: {
    position: 'absolute',
    bottom: '100%',
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 22,
    lineHeight: 34,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#F4F0FF',
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    marginBottom: 22,
  },
  // 288×62 — пропорции обрезанной полоски загрузки.
  loader: { width: 216, height: 46 },
});
