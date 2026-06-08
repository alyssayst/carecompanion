import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PrivateRoute from "@/components/PrivateRoute";
import Welcome from "./pages/Welcome";
import CreateAccount from "./pages/CreateAccount";
import Onboarding from "./pages/Onboarding";
import NeedsSelection from "./pages/NeedsSelection";
import HomeScreen from "./pages/HomeScreen";
import Community from "./pages/Community";
import MapScreen from "./pages/MapScreen";
import PlacePage from "./pages/PlacePage";
import Profile from "./pages/Profile";
import OtherUserProfile from "./pages/OtherUserProfile";
import RequestService from "./pages/RequestService";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/onboarding/:step" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
          <Route path="/needs" element={<PrivateRoute><NeedsSelection /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><HomeScreen /></PrivateRoute>} />
          <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
          <Route path="/map" element={<PrivateRoute><MapScreen /></PrivateRoute>} />
          <Route path="/place/:slug" element={<PrivateRoute><PlacePage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/user/:id" element={<PrivateRoute><OtherUserProfile /></PrivateRoute>} />
          <Route path="/request-service" element={<PrivateRoute><RequestService /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
