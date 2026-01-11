import { useState, useEffect } from "react";
import { View, Alert, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import { useBookStore } from "../../store/bookStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { sleep } from ".";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function Profile() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);
  const params = useLocalSearchParams();
  const notifyBookDeleted = useBookStore((state) => state.notifyBookDeleted);
  const booksUpdatedAt = useBookStore((state) => state.updatedAt);
  const { token } = useAuthStore();

  const router = useRouter();
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/books/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setBooks(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  if (token) fetchData();
}, [token, booksUpdatedAt]);

  const handleDeleteBook = async (bookId) => {
    try {
      setDeleteBookId(bookId);

      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      notifyBookDeleted(bookId);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      Alert.alert("Success", "Recommendation deleted");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setDeleteBookId(null);
    }
  };

  const confirmDelete = (bookId) => {
    Alert.alert("Delete Recommendation", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteBook(bookId),
      },
    ]);
  };

  const renderRatingStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? "star" : "star-outline"}
        size={14}
        color={i < rating ? "#f4b400" : COLORS.textSecondary}
        style={{ marginRight: 2 }}
      />
    ));

  const renderBookItem = ({ item }) => (
  <View style={styles.bookItem}>
    <Image source={{ uri: item.image }} style={styles.bookImage} />

    <View style={styles.bookInfo}>
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text style={styles.bookAuthor}>{item.author}</Text>

      <View style={styles.ratingContainer}>
        {renderRatingStars(item.rating)}
      </View>

      <Text style={styles.bookCaption} numberOfLines={2}>
        {item.caption}
      </Text>

      <Text style={styles.bookDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>

    {/* ACTION BUTTONS */}
    <View style={styles.actionButtons}>
      {/* EDIT */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() =>
          router.push({
            pathname: "/edit",
            params: {
              id: item._id,
              title: item.title,
              author: item.author,
              caption: item.caption,
              rating: item.rating,
              image: item.image,
            },
          })
        }
      >
        <Ionicons name="create-outline" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      {/* 🗑 DELETE */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => confirmDelete(item._id)}
      >
        {deleteBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={22} color={COLORS.primary} />
        )}
      </TouchableOpacity>
      </View>
    </View>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await sleep(500);
    setRefreshing(false);
  };
  useFocusEffect(
    useCallback(() => {
      if (params.refresh) {
        handleRefresh();
        router.replace({ pathname: "/profile" });
      }
    }, [params.refresh])
  );

  if (isLoading && !refreshing) return <Loader />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendations 📚</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
