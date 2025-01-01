// src/services/dataService.ts
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "QuizAppDB";
const STORE_NAME = "jsonFiles";
const DB_VERSION = 1;

export class DataService {
  private db: IDBPDatabase | null = null;

  async initialize() {
    try {
      console.log("Initialisation de la base de données...");
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Création du store s'il n'existe pas
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      });
      console.log("Base de données initialisée");

      // Vérifier et initialiser les données par défaut
      await this.initializeDefaultData();
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de la base de données:",
        error
      );
      throw error;
    }
  }

  private async initializeDefaultData() {
    // Vérifier et charger les données par défaut pour structure.json
    const structureData = await this.getData("structure");
    if (!structureData) {
      const defaultStructure = await import("../data/structure.json");
      await this.updateData("structure", defaultStructure.default);
    }

    // Vérifier et charger les données par défaut pour questions.json
    const questionsData = await this.getData("questions");
    if (!questionsData) {
      const defaultQuestions = await import("../data/questions.json");
      await this.updateData("questions", defaultQuestions.default);
    }
  }

  async getData(fileType: "structure" | "questions") {
    try {
      if (!this.db) {
        throw new Error("Base de données non initialisée");
      }

      const data = await this.db.get(STORE_NAME, fileType);
      return data || null;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${fileType}:`, error);
      throw error;
    }
  }

  async updateData(fileType: "structure" | "questions", content: any) {
    try {
      if (!this.db) {
        throw new Error("Base de données non initialisée");
      }

      await this.db.put(STORE_NAME, content, fileType);
      console.log(`${fileType} mis à jour avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${fileType}:`, error);
      throw error;
    }
  }

  async resetToDefault(fileType: "structure" | "questions") {
    try {
      const defaultData = await import(`../data/${fileType}.json`);
      await this.updateData(fileType, defaultData.default);
      console.log(`${fileType} réinitialisé aux valeurs par défaut`);
    } catch (error) {
      console.error(
        `Erreur lors de la réinitialisation de ${fileType}:`,
        error
      );
      throw error;
    }
  }

  async exportData(fileType: "structure" | "questions") {
    const data = await this.getData(fileType);
    return data ? JSON.stringify(data, null, 2) : null;
  }
}

// Export d'une instance unique pour toute l'application
export const dataService = new DataService();
