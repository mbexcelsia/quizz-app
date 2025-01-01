// src/services/fileService.ts
export const fileService = {
  async readJsonFile(fileName: string) {
    try {
      // Import dynamique des fichiers JSON
      const module = await import(`../data/${fileName}`);
      return module.default;
    } catch (error) {
      console.error(`Erreur lors de la lecture du fichier ${fileName}:`, error);
      throw error;
    }
  },

  async downloadFile(fileType: string) {
    try {
      // Import dynamique des fichiers JSON
      const data = await import(`../data/${fileType}`);
      // Convertir l'objet en chaîne JSON formatée
      return JSON.stringify(data.default, null, 2);
    } catch (error) {
      console.error(
        `Erreur lors du téléchargement du fichier ${fileType}:`,
        error
      );
      throw error;
    }
  },

  async uploadFile(fileName: string, content: string) {
    try {
      console.log(`Début de l'upload du fichier ${fileName}`);

      if (typeof window.fs?.writeFile !== "function") {
        throw new Error(
          "La fonction d'écriture de fichier n'est pas disponible"
        );
      }

      // Écriture du fichier
      await window.fs.writeFile(fileName, content);
      console.log(`Fichier ${fileName} uploadé avec succès`);

      // Forcer le rechargement des données
      const module = await import(`../data/${fileName}?update=${Date.now()}`);
      return module.default;
    } catch (error) {
      console.error(`Erreur lors de l'upload du fichier ${fileName}:`, error);
      throw error;
    }
  },
};
