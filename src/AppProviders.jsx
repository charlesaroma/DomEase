/* App Providers */
import { QueryClientProvider } from "@tanstack/react-query";

import { AdminAuthProvider } from "./store/context/AdminAuthContext";
import { queryClient } from "./store/queryClient";

// Every app-wide provider is mounted here, once, so App.jsx stays a router.
export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </QueryClientProvider>
  );
}
