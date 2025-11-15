import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Movies from "./pages/Movies";
import MovieForm from "./pages/MovieForm";
import Genres from "./pages/Genres";
import Customers from "./pages/Customers";
import Rentals from "./pages/Rentals";
import Returns from "./pages/Returns";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth"; // Import your component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ======================================= */}
          {/* 1. Public Routes (No Auth needed) */}
          {/* ======================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout><Index /></Layout>} />

          {/* ======================================= */}
          {/* 2. Protected Routes (Auth IS needed) */}
          {/* ======================================= */}
          {/* This <Route> wrapper uses your RequireAuth component.
              All child routes nested inside will be protected. */}
          <Route element={<RequireAuth />}>
            <Route path="/movies" element={<Layout><Movies /></Layout>} />
            <Route path="/movies/new" element={<Layout><MovieForm /></Layout>} />
            <Route path="/movies/:id/edit" element={<Layout><MovieForm /></Layout>} />
            <Route path="/genres" element={<Layout><Genres /></Layout>} />
            <Route path="/customers" element={<Layout><Customers /></Layout>} />
            <Route path="/rentals" element={<Layout><Rentals /></Layout>} />
            <Route path="/returns" element={<Layout><Returns /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
          </Route>

          {/* ======================================= */}
          {/* 3. Catch-All 404 Route */}
          {/* ======================================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;