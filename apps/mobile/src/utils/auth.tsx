// import * as Linking from "expo-linking";
// import { useRouter } from "expo-router";
// import * as Browser from "expo-web-browser";

// import { api } from "./api";
// import { getBaseUrl } from "./base-url";
// import { deleteToken, setToken } from "./session-store";

// export const signIn = async () => {
//   const signInUrl = `${getBaseUrl()}/api/auth/signin`;
//   const redirectTo = Linking.createURL("/login");
//   const result = await Browser.openAuthSessionAsync(
//     `${signInUrl}?expo-redirect=${encodeURIComponent(redirectTo)}`,
//     redirectTo,
//   );

//   if (result.type !== "success") return;
//   const url = Linking.parse(result.url);
//   const sessionToken = String(url.queryParams?.session_token);
//   if (!sessionToken) return;

//   setToken(sessionToken);
// };

// export const useUser = () => {
//   const { data: session } = api.auth.getSession.useQuery();
//   return session?.user ?? null;
// };

// export const useSignIn = () => {
//   const utils = api.useUtils();
//   const router = useRouter();

//   return async () => {
//     await signIn();
//     await utils.invalidate();
//     router.replace("/");
//   };
// };

// export const useSignOut = () => {
//   const utils = api.useUtils();
//   const signOut = api.auth.signOut.useMutation();
//   const router = useRouter();

//   return async () => {
//     const res = await signOut.mutateAsync();
//     if (!res.success) return;
//     await deleteToken();
//     await utils.invalidate();
//     router.replace("/");
//   };
// };

import {
  AppleAuthenticationScope,
  signInAsync,
} from "expo-apple-authentication";
import {
  CryptoDigestAlgorithm,
  digestStringAsync,
  randomUUID,
} from "expo-crypto";

/**
 * Initiates the auth flow for the native Apple Sign In.
 * Returns the token and nonce that will later be passed
 * to Supabase to complete the sign in.
 */
export async function initiateAppleSignIn() {
  const rawNonce = randomUUID();
  const hashedNonce = await digestStringAsync(
    CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const credential = await signInAsync({
    requestedScopes: [
      AppleAuthenticationScope.FULL_NAME,
      AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  const token = credential.identityToken;
  if (!token) throw new Error("No id token");

  return { token, nonce: rawNonce };
}
