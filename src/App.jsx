import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { onAppReady } from '@/lib/native';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import AdminRoute from '@/components/AdminRoute';
import Home from '@/pages/Home';
import SeriesDetail from '@/pages/SeriesDetail';
import Watch from '@/pages/Watch';
import Subscribe from '@/pages/Subscribe';
import Admin from '@/pages/Admin';
import MyLibrary from '@/pages/MyLibrary';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import AuthCallback from '@/pages/AuthCallback';

const AppRoutes = () => {
  const { isLoadingAuth } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth) onAppReady();
  }, [isLoadingAuth]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/my" element={<MyLibrary />} />
        <Route path="/profile" element={<Profile />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
