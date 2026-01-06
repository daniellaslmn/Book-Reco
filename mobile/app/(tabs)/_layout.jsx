import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import COLORS from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";

export default function TabLayout() {
    const { token } = useAuthStore();
    const insets = useSafeAreaInsets();

    if (!token) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>
          You must login to see content
        </Text>
      </View>
    );
  }
  return (
    <Tabs
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            headerTitleStyle: {
                color: COLORS.textPrimary,
                fontWeight: "600",
            },
            headerShadowVisible: false,
            tabBarStyle:{
                backgroundColor: COLORS.cardBackground,
                borderTopWidth: 1,
                borderTopColor: COLORS.border,
                paddingTop: 5,
                paddingBottom: insets.bottom,
                height: 60 + insets.bottom,
            },
        }}
    >
        <Tabs.Screen 
            name="index" 
            options={{
                title: "Home",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="home-outline" size={size} color={color}/>
                ),
            }}
        />

        <Tabs.Screen 
            name="create"
            options={{
                title: "Create",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="add-circle-outline" size={size} color={color}/>
                ),
            }}
        />

        <Tabs.Screen 
            name="favorites" 
            options={{
                title: "Favorites",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="heart-circle-outline" size={size} color={color}/>
                ),
            }}
        
        />

        <Tabs.Screen 
            name="profile" 
            options={{
                title: "Profile",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="person-outline" size={size} color={color}/>
                ),
            }}
        
        />

    </Tabs>
  );
}