import { StyleSheet, View } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { Link, Stack } from "expo-router";

const DevMenuPage = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Dev Menu",
        }}
      />
      <Text style={styles.title}>Hello, World!</Text>
      <Link href={"/examples/db-example"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          Database Test
        </Button>
      </Link>

      <Link href={"/examples/empty-example"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          Example Page
        </Button>
      </Link>

      <Link href={"/home"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          Home
        </Button>
      </Link>
      
      <Link href={"/account/login"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          Login
        </Button>
      </Link>
      
      <Link href={"/availability/standard"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          Availability
        </Button>
      </Link>

      <Link href={"/profile"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          Profile
        </Button>
      </Link>

      <Link href={"/workplaces"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          WorkPlace
        </Button>
      </Link>

      <Link href={"/work-shifts"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          My Shifts 
        </Button>
      </Link>

      <Link href={"/test/WorkShiftAgendaItemRenderTest"} asChild>
        <Button style={styles.pageBtn} appearance="outline">
          Work Shift Agenda Item
        </Button>
      </Link>
    </View>
  );
};

// const Home = () => {
//   return (
//     <View>

//     </View>
//   )
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  pageBtn: {
    marginVertical: 8,
  },
});

export default DevMenuPage;
