// src/services/playerService.ts
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { PlayerProfile } from "../config/firebase";

export interface UserPlayers {
  players: PlayerProfile[];
  lastUpdated: Date;
}

export const playerService = {
  // Sauvegarder les profils des joueurs pour un utilisateur
  async savePlayers(userId: string, players: PlayerProfile[]): Promise<void> {
    try {
      const userPlayersRef = doc(db, "userPlayers", userId);
      await setDoc(userPlayersRef, {
        players,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des joueurs:", error);
      throw new Error("Impossible de sauvegarder les joueurs");
    }
  },

  // Récupérer les profils des joueurs d'un utilisateur
  async getPlayers(userId: string): Promise<PlayerProfile[]> {
    try {
      const userPlayersRef = doc(db, "userPlayers", userId);
      const docSnap = await getDoc(userPlayersRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserPlayers;
        return data.players;
      }

      return []; // Retourne un tableau vide si aucun joueur n'est trouvé
    } catch (error) {
      console.error("Erreur lors de la récupération des joueurs:", error);
      throw new Error("Impossible de récupérer les joueurs");
    }
  },

  // Mettre à jour le profil d'un joueur spécifique
  async updatePlayerProfile(
    userId: string,
    playerIndex: number,
    playerData: Partial<PlayerProfile>
  ): Promise<void> {
    try {
      const userPlayersRef = doc(db, "userPlayers", userId);
      const docSnap = await getDoc(userPlayersRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserPlayers;
        const players = [...data.players];

        if (playerIndex >= 0 && playerIndex < players.length) {
          players[playerIndex] = {
            ...players[playerIndex],
            ...playerData,
          };

          await updateDoc(userPlayersRef, {
            players,
            lastUpdated: new Date(),
          });
        } else {
          throw new Error("Index de joueur invalide");
        }
      } else {
        throw new Error("Aucun profil de joueur trouvé");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw new Error("Impossible de mettre à jour le profil du joueur");
    }
  },

  // Sauvegarder les sélections d'un joueur
  async savePlayerSelections(
    userId: string,
    playerIndex: number,
    selections: PlayerProfile["selections"]
  ): Promise<void> {
    try {
      const userPlayersRef = doc(db, "userPlayers", userId);
      const docSnap = await getDoc(userPlayersRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserPlayers;
        const players = [...data.players];

        if (playerIndex >= 0 && playerIndex < players.length) {
          players[playerIndex].selections = selections;

          await updateDoc(userPlayersRef, {
            players,
            lastUpdated: new Date(),
          });
        } else {
          throw new Error("Index de joueur invalide");
        }
      } else {
        throw new Error("Aucun profil de joueur trouvé");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des sélections:", error);
      throw new Error("Impossible de sauvegarder les sélections du joueur");
    }
  },
};
