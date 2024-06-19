import { Stack } from "expo-router";
import { ApplicationProvider } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";

export default function RootLayout() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Stack>
        {/* Hide the stack display for home page. */}
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </ApplicationProvider>
  );
}
