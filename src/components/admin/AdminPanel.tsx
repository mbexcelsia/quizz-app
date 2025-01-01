// src/components/admin/AdminPanel.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import UserManagement from "./UserManagement";
import DataManagement from "./DataManagement";

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"users" | "stats" | "data">(
    "users"
  );

  return (
    <div className="section w-full max-w-4xl mx-auto">
      <div className="section-header">
        <h2 className="section-title">Administration</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Onglets */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "users"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Utilisateurs
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "data"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("data")}
        >
          Données
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "stats"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("stats")}
        >
          Statistiques
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-4">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "data" && <DataManagement />}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <p className="text-gray-500 italic">Statistiques à venir...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
