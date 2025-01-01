// src/components/admin/DataManagement.tsx
import React, { useState } from "react";
import { dataService } from "../../services/dataService";
import { Download, Upload, RefreshCw } from "lucide-react";

const DataManagement: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fonction pour télécharger un fichier
  const handleDownload = async (fileType: "structure" | "questions") => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer les données depuis IndexedDB
      const data = await dataService.exportData(fileType);
      if (!data) {
        throw new Error(`Fichier ${fileType}.json non trouvé`);
      }

      // Créer le blob et le lien de téléchargement
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileType}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err);
      setError(
        `Une erreur est survenue lors du téléchargement du fichier ${fileType}.json`
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour valider le contenu du fichier
  const validateFileContent = (
    content: any,
    fileType: "structure" | "questions"
  ): boolean => {
    try {
      if (fileType === "structure") {
        return (
          content.TOPICS &&
          Array.isArray(content.TOPICS) &&
          content.LEVELS &&
          Array.isArray(content.LEVELS) &&
          content.TOPICS.every(
            (topic: any) =>
              "main-topic" in topic &&
              "subtopic" in topic &&
              "sub-subtopic" in topic
          ) &&
          content.LEVELS.every(
            (level: any) =>
              "main-level" in level &&
              "sublevel" in level &&
              "sub-sublevel" in level
          )
        );
      } else {
        return (
          content.Questions &&
          Array.isArray(content.Questions) &&
          content.Questions.every(
            (q: any) =>
              "id" in q &&
              "main-topic" in q &&
              "subtopic" in q &&
              "sub-subtopic" in q &&
              "main-level" in q &&
              "sublevel" in q &&
              "sub-sublevel" in q &&
              "question" in q &&
              "answer" in q
          )
        );
      }
    } catch {
      return false;
    }
  };

  // Fonction de réinitialisation
  const handleReset = async (fileType: "structure" | "questions") => {
    setLoading(true);
    setError(null);
    try {
      await dataService.resetToDefault(fileType);
      setError(`Le fichier ${fileType}.json a été réinitialisé avec succès`);
      window.location.reload();
    } catch (err) {
      console.error("Erreur lors de la réinitialisation:", err);
      setError(`Erreur lors de la réinitialisation de ${fileType}.json`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer l'upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "structure" | "questions"
  ) => {
    setError(null);
    setLoading(true);
    try {
      const file = event.target.files?.[0];
      if (!file) {
        setError("Aucun fichier sélectionné");
        return;
      }

      // Lecture du fichier
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      // Parser et valider le contenu
      const content = JSON.parse(fileContent);
      if (!validateFileContent(content, fileType)) {
        setError(
          `Le format du fichier ${fileType}.json n'est pas valide. Vérifiez que tous les champs requis sont présents.`
        );
        return;
      }

      // Upload et mise à jour dans IndexedDB
      await dataService.updateData(fileType, content);

      setError(`Le fichier ${fileType}.json a été uploadé avec succès`);

      // Forcer le rechargement de l'application (optionnel)
      window.location.reload();
    } catch (error: any) {
      const errorMessage =
        error.message ||
        `Erreur lors du traitement du fichier ${fileType}.json`;
      setError(errorMessage);
      console.error("Erreur d'upload:", error);
    } finally {
      setLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          className={`p-3 mb-4 rounded-md ${
            error.includes("succès")
              ? "bg-green-50 border-green-200 text-green-600"
              : "bg-red-50 border-red-200 text-red-600"
          } border`}
        >
          {error}
          <button
            className="ml-2 text-sm underline"
            onClick={() => setError(null)}
          >
            Fermer
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Structure.json</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload("structure")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50"
                disabled={loading}
              >
                <Download size={18} />
                {loading ? "Chargement..." : "Télécharger"}
              </button>
              <button
                onClick={() => handleReset("structure")}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 disabled:opacity-50"
                disabled={loading}
              >
                <RefreshCw size={18} />
                {loading ? "Chargement..." : "Réinitialiser"}
              </button>
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 cursor-pointer disabled:opacity-50">
                <Upload size={18} />
                {loading ? "Chargement..." : "Upload"}
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "structure")}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Questions.json</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload("questions")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50"
                disabled={loading}
              >
                <Download size={18} />
                {loading ? "Chargement..." : "Télécharger"}
              </button>
              <button
                onClick={() => handleReset("questions")}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 disabled:opacity-50"
                disabled={loading}
              >
                <RefreshCw size={18} />
                {loading ? "Chargement..." : "Réinitialiser"}
              </button>
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 cursor-pointer disabled:opacity-50">
                <Upload size={18} />
                {loading ? "Chargement..." : "Upload"}
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "questions")}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
