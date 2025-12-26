import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.container}>
      <Text style={styles.title}>Choi Seungcheol with Yoon Jeonghan</Text>
     
      <Link href="/(auth)/signup">Signup</Link>
      <Link href="/(auth)">Login Page</Link>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color:"black",
  }
});