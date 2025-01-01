import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc, // Ajout de cet import
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { User } from "../config/firebase";

export interface AuthError {
  code: string;
  message: string;
}

export const authService = {
  // Inscription
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<UserCredential> {
    try {
      console.log("Début de l'inscription...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Utilisateur Firebase créé:", userCredential.user.uid);

      // Création du document utilisateur dans Firestore
      const userData = {
        uid: userCredential.user.uid,
        email,
        displayName,
        isAdmin: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      // Attendre explicitement la création du document
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      console.log("Document Firestore créé pour l'utilisateur");

      // Attendre un court instant pour s'assurer que les données sont disponibles
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return userCredential;
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      let message = "Une erreur est survenue lors de l'inscription";

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "Cette adresse email est déjà utilisée";
          break;
        case "auth/invalid-email":
          message = "Adresse email invalide";
          break;
        case "auth/operation-not-allowed":
          message = "L'inscription par email/mot de passe n'est pas activée";
          break;
        case "auth/weak-password":
          message = "Le mot de passe doit contenir au moins 6 caractères";
          break;
        default:
          if (error.message) {
            message = error.message;
          }
      }

      throw new Error(message);
    }
  },

  // Connexion
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Mise à jour de la dernière connexion
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      return userCredential;
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      let message = "Une erreur est survenue lors de la connexion";

      switch (error.code) {
        case "auth/invalid-email":
          message = "Adresse email invalide";
          break;
        case "auth/user-disabled":
          message = "Ce compte a été désactivé";
          break;
        case "auth/user-not-found":
          message = "Aucun compte ne correspond à cette adresse email";
          break;
        case "auth/wrong-password":
          message = "Mot de passe incorrect";
          break;
        default:
          if (error.message) {
            message = error.message;
          }
      }

      throw new Error(message);
    }
  },

  // Déconnexion
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error("Erreur de déconnexion:", error);
      throw new Error("Une erreur est survenue lors de la déconnexion");
    }
  },

  // Récupération des données utilisateur
  async getUserData(uid: string): Promise<User | null> {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Conversion explicite des timestamps
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || new Date(),
        } as User;
      }
      return null;
    } catch (error: any) {
      console.error("Erreur de récupération des données:", error);
      throw new Error(
        "Une erreur est survenue lors de la récupération des données utilisateur"
      );
    }
  },

  // Nouvelle fonction : Obtenir le nombre d'administrateurs
  async getAdminCount(): Promise<number> {
    try {
      const usersRef = collection(db, "users");
      const adminQuery = query(usersRef, where("isAdmin", "==", true));
      const snapshot = await getDocs(adminQuery);
      return snapshot.size;
    } catch (error) {
      console.error("Erreur lors du comptage des administrateurs:", error);
      throw new Error("Impossible de vérifier le nombre d'administrateurs");
    }
  },

  // Suppression d'utilisateur (version modifiée)
  async deleteUser(userId: string): Promise<void> {
    try {
      // Vérifier que l'utilisateur courant est admin
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Non authentifié");
      }

      // Vérifier les permissions admin
      const adminDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!adminDoc.exists() || !adminDoc.data().isAdmin) {
        throw new Error("Droits administrateur requis");
      }

      // Vérifier si l'utilisateur à supprimer est admin
      const isUserAdmin = await this.isUserAdmin(userId);
      if (isUserAdmin) {
        const adminCount = await this.getAdminCount();
        if (adminCount <= 1) {
          throw new Error("Impossible de supprimer le dernier administrateur");
        }
      }

      // Supprimer le document utilisateur de Firestore
      await deleteDoc(doc(db, "users", userId));

      // Supprimer l'authentification si l'utilisateur supprime son propre compte
      if (currentUser.uid === userId) {
        await currentUser.delete();
      }

      console.log("Utilisateur supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      throw new Error(error.message || "Impossible de supprimer l'utilisateur");
    }
  },

  // Nouvelle fonction : Vérifier si un utilisateur est admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      return userDoc.exists() && userDoc.data().isAdmin === true;
    } catch (error) {
      console.error("Erreur lors de la vérification du statut admin:", error);
      return false;
    }
  },

  // Modifier un statut admin
  async updateAdminStatus(
    userId: string,
    newAdminStatus: boolean
  ): Promise<void> {
    try {
      // Vérifier que l'utilisateur courant est admin
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Non authentifié");
      }

      // Si on retire les droits admin, vérifier qu'il restera au moins un admin
      if (!newAdminStatus) {
        const isCurrentUserAdmin = await this.isUserAdmin(userId);
        if (isCurrentUserAdmin) {
          const adminCount = await this.getAdminCount();
          if (adminCount <= 1) {
            throw new Error("Impossible de révoquer le dernier administrateur");
          }
        }
      }

      // Mise à jour du statut
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isAdmin: newAdminStatus,
      });
    } catch (error: any) {
      console.error("Erreur lors de la modification du statut admin:", error);
      throw new Error(
        error.message || "Impossible de modifier le statut administrateur"
      );
    }
  },
};
