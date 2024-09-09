import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

import { NAV_THEME } from "@acme/uim/src/lib/constants";
import { PortalHost } from "@acme/uim/src/ui/portal";

import { HeaderBackButton, HeaderTitle } from "../components/header";
import { TRPCProvider } from "../utils/api";
import { supabase } from "../utils/supabase";

import "../styles.css";

import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cssInterop, useColorScheme } from "nativewind";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

cssInterop(SafeAreaView, { className: "style" });

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const isDarkColorScheme = colorScheme === "dark";

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem("theme");
      if (Platform.OS === "web") {
        // Adds the background color to the html element to prevent white background on overscroll.
        // document.documentElement.classList.add("bg-background");
      }
      if (!theme) {
        AsyncStorage.setItem("theme", colorScheme ?? "dark");
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === "dark" ? "dark" : "light";
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <TRPCProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          {/*
           * The Stack component displays the current page.
           * It also allows you to configure your screens
           */}
          <Stack
            screenOptions={{
              headerLeft: HeaderBackButton,
              headerTitle: HeaderTitle,
              headerStyle: {
                backgroundColor: "#18181A",
              },
            }}
          >
            {/*
             * Present the profile screen as a modal
             * @see https://expo.github.io/router/docs/guides/modals
             */}
            <Stack.Screen
              name="profile"
              options={{
                presentation: "modal",
                headerTitle: () => <></>,
              }}
            />
          </Stack>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <PortalHost />
        </ThemeProvider>
      </TRPCProvider>
    </SessionContextProvider>
  );
}
