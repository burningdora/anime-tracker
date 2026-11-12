// Лабораторная №2, вариант 1 «Каталог товаров».
// Готовый экран на DummyJSON: SafeAreaView + ScrollView + map(), limit/skip,
// четыре состояния UI, AbortController. Можно скопировать в src/app/lab2.tsx
// и открыть по маршруту /lab2, если преподаватель просит показать лабу.

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  rating: number;
  thumbnail: string;
};

type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

const PAGE_SIZE = 6;

const colors = {
  bg: '#0E1016',
  surface: '#171A23',
  border: '#2A2F3D',
  text: '#F2F4F8',
  muted: '#98A1B3',
  accent: '#8B5CF6',
  danger: '#F0616D',
};

export default function Lab2Screen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Кнопка «Повторить»: меняем ключ, чтобы эффект запустился снова.
  const [reloadKey, setReloadKey] = useState(0);

  // Derived value: не храним в state.
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadProducts() {
      const skip = (page - 1) * PAGE_SIZE;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}` +
            '&select=id,title,price,category,rating,thumbnail',
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as ProductsResponse;

        if (!active) return;
        setProducts(data.products);
        setTotal(data.total);
      } catch (cause) {
        if (!active || controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : 'Не удалось загрузить данные');
      } finally {
        if (active && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, reloadKey]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Text style={styles.title}>Каталог товаров</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>Ошибка: {error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setReloadKey(value => value + 1)}>
            <Text style={styles.action}>Повторить</Text>
          </Pressable>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>На этой странице нет товаров.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {products.map(product => (
            <View key={product.id} style={styles.card}>
              <View style={styles.imageBox}>
                <Image source={{ uri: product.thumbnail }} style={styles.image} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {product.title}
                </Text>
                <Text style={styles.muted}>{product.category}</Text>
                <View style={styles.row}>
                  <Text style={styles.price}>${product.price}</Text>
                  <Text style={styles.rating}>★ {product.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.pagination}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Предыдущая страница"
          disabled={page === 1 || loading}
          onPress={() => setPage(prev => Math.max(1, prev - 1))}
          style={[styles.button, (page === 1 || loading) && styles.disabled]}>
          <Text style={styles.buttonText}>← Назад</Text>
        </Pressable>

        <Text style={styles.counter}>
          Страница {page} / {totalPages}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Следующая страница"
          disabled={page >= totalPages || loading}
          onPress={() => setPage(prev => prev + 1)}
          style={[styles.button, (page >= totalPages || loading) && styles.disabled]}>
          <Text style={styles.buttonText}>Далее →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  error: { color: colors.danger, fontSize: 15, textAlign: 'center' },
  muted: { color: colors.muted, fontSize: 14 },
  action: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  imageBox: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#2A2145',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  cardBody: { flex: 1, justifyContent: 'center', gap: 4 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rating: { color: '#FBBF24', fontSize: 13, fontWeight: '700' },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.35 },
  buttonText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  counter: { color: colors.muted, fontSize: 14 },
});
