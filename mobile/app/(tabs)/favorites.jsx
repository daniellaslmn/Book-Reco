import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../../store/authStore";
import { useFavoriteStore } from "../../store/favoriteStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/home.styles";
import Loader from "../../components/Loader";
import { formatPublishDate } from "../../lib/utils";
import { Alert } from 'react-native';


export default function Favorites() {
  const { token } = useAuthStore();
  const [favorites, setFavorites] = useState([]);
  const updatedAt = useFavoriteStore((state) => state.updatedAt); // subscribe to changes
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshFavorites } = useFavoriteStore();
  

  // Fetch favorite books
  const fetchFavorites = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${API_URL}/books/favorites/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        throw new Error(text || "Failed to fetch favorites");
      }

      if (!response.ok) throw new Error(data?.message || "Failed to fetch favorites");

      setFavorites(data);
    } catch (error) {
      console.error("Favorite error:", error.message);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    fetchFavorites();
  }, [updatedAt, token]);

  // Unfavorite
  const unfavoriteBook = async (bookId) => {
  try {
    // Call API to remove favorite
     const response = await fetch(`${API_URL}/books/${bookId}/favorites`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }
      throw new Error(data?.message || "Failed to remove from favorites");
    }

    // Update local state immediately
    setFavorites((prev) => prev.filter((b) => b._id !== bookId));
  // Notify Home
  refreshFavorites();


    Alert.alert("Removed from Favorites", "Book removed from your favorites successfully!");

  } catch (error) {
    console.error("Unfavorite error:", error.message);
  }
};

  const renderRatingStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? "star" : "star-outline"}
        size={16}
        color={i < rating ? "#f4b400" : COLORS.textSecondary}
        style={{ marginRight: 2 }}
      />
    ));

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
        <TouchableOpacity onPress={() => unfavoriteBook(item._id)}>
            <Ionicons
              name="heart"
              size={22}
              color="red"
            />
          </TouchableOpacity>

      </View>

      <View style={styles.bookImageContainer}>
        <Image source={item.image} style={styles.bookImage} contentFit="cover" />
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFavorites(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Favorites ❤️</Text>
            <Text style={styles.headerSubtitle}>Books you loved and saved</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Tap the heart icon to save books</Text>
          </View>
        }
      />
    </View>
    
  );
}
