// src/components/admin/UserManagement.tsx
import React, { useState, useEffect } from "react";
import {
  doc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { User } from "../../config/firebase";
import { authService } from "../../services/authService"; // Nouvel import

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          uid: doc.id,
        })) as User[];
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err);
        setError("Impossible de charger la liste des utilisateurs");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await authService.updateAdminStatus(userId, !currentStatus);

      // Mise à jour de l'interface utilisateur
      setUsers(
        users.map((user) =>
          user.uid === userId ? { ...user, isAdmin: !currentStatus } : user
        )
      );
    } catch (err: any) {
      console.error("Erreur lors de la modification du statut:", err);
      setError(
        err.message || "Impossible de modifier le statut administrateur"
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        // Utiliser le service d'authentification pour la suppression
        await authService.deleteUser(userId);

        // Mettre à jour la liste des utilisateurs
        setUsers(users.filter((user) => user.uid !== userId));
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        setError("Impossible de supprimer l'utilisateur");
      }
    }
  };

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
              Admin
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.uid}>
              <td className="px-6 py-4 text-sm">{user.displayName}</td>
              <td className="px-6 py-4 text-sm">{user.email}</td>
              <td className="px-6 py-4 text-sm">
                {user.isAdmin ? "Oui" : "Non"}
              </td>
              <td className="px-6 py-4 text-sm space-x-2">
                <button
                  onClick={() => toggleAdminStatus(user.uid, user.isAdmin)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.isAdmin
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {user.isAdmin ? "Retirer admin" : "Rendre admin"}
                </button>
                <button
                  onClick={() => handleDeleteUser(user.uid)}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
