/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import { useAuth } from "./hooks/useAuth";
import Projects from "./pages/Projects";
import Habits from "./pages/Habits";
import Nutrition from "./pages/Nutrition";
import Health from "./pages/Health";
import FinanceTransactions from "./pages/FinanceTransactions";
import FinanceAnalytics from "./pages/FinanceAnalytics";
import Investments from "./pages/Investments";
import Goals from "./pages/Goals";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/projects" element={<Projects />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/finance/transactions" element={<FinanceTransactions />} />
          <Route path="/finance/analytics" element={<FinanceAnalytics />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/focus" element={
            <div className="flex items-center justify-center h-full">
              <h2 className="display-lg opacity-20">Modo Foco</h2>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
