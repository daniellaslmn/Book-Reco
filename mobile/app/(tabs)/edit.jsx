import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import { API_URL } from "../constants/api";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/create.styles";
import COLORS from "../constants/colors";

export default function EditBook() {
  const router = useRouter();
  const { token } = useAuthStore();
  const params = useLocalSearchParams();

  const [title, setTitle] = useState(params.title);
  const [author, setAuthor] = useState(params.author);
  const [caption, setCaption] = useState(params.caption);
  const [rating, setRating] = useState(Number(params.rating));
  const [image, setImage] = useState(params.image);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const confirmUpdate = () => {
    Alert.alert(
      "Update Book",
      "Save changes to this recommendation?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: handleUpdate },
      ]
    );
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      let imagePayload = undefined;

      // only upload image if user changed it
      if (imageBase64) {
        const base64 = `data:image/jpeg;base64,${imageBase64}`;
        imagePayload = base64;
      }

      const response = await fetch(`${API_URL}/books/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          author,
          caption,
          rating,
          image: imagePayload, 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      Alert.alert("Success", "Book updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Recommendation</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />

      <TextInput
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
        placeholder="Author"
      />

      <TextInput
        style={styles.textArea}
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Image source={{ uri: image }} style={styles.previewImage} />
        <Text style={{ color: COLORS.primary }}>Change Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={confirmUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
