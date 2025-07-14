import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from 'expo-router';

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Read the latest gym news',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const API_KEY = '2962473991e447368499f89ad9ae0571';

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=gym+fitness+nutrition&language=en&sortBy=publishedAt&pageSize=15&apiKey=${API_KEY}`
      );
      const data = await res.json();
      if (!data.articles) throw new Error('Invalid response');
      setNews(data.articles);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      
      {loading && <ActivityIndicator size="large" color="#ffd33d" />}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}

      {!loading && !error && (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {news.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.card}
              onPress={() => Linking.openURL(item.url)}
              activeOpacity={0.9}
            >
              {item.urlToImage ? (
                <Image source={{ uri: item.urlToImage }} style={styles.thumbnail} />
              ) : null}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.cardDescription}>{item.description}</Text>
                )}
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    {item.source?.name || 'Unknown Source'} -n {formatDate(item.publishedAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', padding: 16 },
  title: { color: '#ffd33d', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  errorText: { color: '#ff5555', fontSize: 16, marginTop: 20 },
  card: {
    backgroundColor: '#2c2c2e',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    borderColor: '#ffd33d',
    borderWidth: 1,
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDescription: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  metaText: {
    color: '#aaa',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
