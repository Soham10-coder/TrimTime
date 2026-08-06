import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { apiCall } from '../services/api';

export default function HomeScreen() {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    "Men's Hair",
    "Women's Hair",
    'Grooming',
    'Facial & Skin',
    'Spa & Massage'
  ];

  const fetchSalons = async () => {
    setLoading(true);
    const res = await apiCall('/barber/browse');
    if (res.ok && Array.isArray(res.data)) {
      setSalons(res.data);
    } else {
      setSalons([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalons();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* HEADER BAR */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>TrimTime 💈</Text>
          <Text style={styles.brandSubtitle}>Premium Salon & Barber Booking</Text>
        </View>
        <View style={styles.liveStatusBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveStatusText}>AWS Cloud Live</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
      >
        {/* HERO BANNER CARD */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTag}>PREMIUM GROOMING</Text>
          <Text style={styles.heroTitle}>Book Top Salons Near You</Text>
          <Text style={styles.heroDesc}>
            Instant slot confirmation, verified barber partners, and seamless digital payments.
          </Text>

          <TouchableOpacity style={styles.heroButton} activeOpacity={0.8}>
            <Text style={styles.heroButtonText}>EXPLORE SALONS ✂️</Text>
          </TouchableOpacity>
        </View>

        {/* CATEGORY SELECTOR */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SALONS LIST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Partner Salons ({salons.length})</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.loadingText}>Fetching Live Salons from Cloud...</Text>
          </View>
        ) : salons.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💈</Text>
            <Text style={styles.emptyTitle}>Ready for New Partner Salons</Text>
            <Text style={styles.emptyDesc}>
              No active salons listed yet. Register your salon shop on TrimTime to appear live here!
            </Text>
          </View>
        ) : (
          salons.map((s) => (
            <View key={s.id || s._id} style={styles.salonCard}>
              {s.profilePic ? (
                <Image source={{ uri: s.profilePic }} style={styles.salonImage} />
              ) : (
                <View style={[styles.salonImage, styles.placeholderImage]}>
                  <Text style={{ fontSize: 32 }}>✂️</Text>
                </View>
              )}
              <View style={styles.salonDetails}>
                <Text style={styles.salonName}>{s.shopName || 'TrimTime Salon'}</Text>
                <Text style={styles.salonSub}>
                  Owner: {s.ownerName || 'Senior Barber'} &bull; {s.city || 'Kolhapur'}
                </Text>
                <Text style={styles.salonAddress}>{s.address || 'Main Street Center'}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.ratingText}>⭐ {s.ratingAvg || '5.0'} / 5</Text>
                  <TouchableOpacity style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Book Slot</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  liveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ade80'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  heroCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24
  },
  heroTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f59e0b',
    letterSpacing: 1.5,
    marginBottom: 6
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8
  },
  heroDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 16
  },
  heroButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  heroButtonText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc'
  },
  categoryScroll: {
    marginBottom: 24
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  categoryChipActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b'
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8'
  },
  categoryTextActive: {
    color: '#0f172a'
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 12
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 6
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18
  },
  salonCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#334155'
  },
  salonImage: {
    width: 80,
    height: 80,
    borderRadius: 12
  },
  placeholderImage: {
    backgroundColor: '#334155',
    alignItems: 'center',
    justify: 'center'
  },
  salonDetails: {
    flex: 1,
    marginLeft: 14
  },
  salonName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc'
  },
  salonSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  salonAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f59e0b'
  },
  bookBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  bookBtnText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '800'
  }
});
