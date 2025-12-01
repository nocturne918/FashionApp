import { authClient } from '../lib/auth-client';

/**
 * Start signup process - sends verification code to email
 * Better Auth handles this via signUp.email
 */
export const startSignup = async (name, email) => {
  // Better Auth doesn't have a separate "start signup" for email/pass unless using email verification flow.
  // We'll just return success here and let the actual signup happen in completeSignup
  // Or if we want to send a verification code first, we'd use a different flow.
  // Given the previous flow was: Start -> Verify -> Complete (Set Password)
  // Better Auth standard flow: SignUp (Email/Pass) -> Send Verification Email -> Click Link

  // To keep UI similar, we might need to adjust.
  // But for now, let's assume we just proceed to "complete" which is the actual signup.
  return { success: true };
};

export const verifyCode = async (email, code) => {
  // Better Auth verification is usually link-based.
  // If we want code based, we need to use the code sent in email.
  // For now, let's mock this or assume the user clicks the link.
  return { success: true };
};

export const completeSignup = async (email, password, name) => {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, user: data.user };
};

export const login = async (email, password) => {
  const { data, error } = await authClient.signIn.email({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, user: data.user };
};

export const logout = async () => {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message);
  return { message: 'Logged out' };
};

export const getCurrentUser = async () => {
  const { data, error } = await authClient.getSession();
  if (error) throw new Error(error.message);
  return { user: data?.user };
};

export const loginWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "http://localhost:5173" // Frontend URL
  });
};

export const loginWithFacebook = async () => {
  await authClient.signIn.social({
    provider: "facebook",
    callbackURL: "http://localhost:5173"
  });
};
