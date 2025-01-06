// src/components/stats/StatsPanel.tsx

import { dataService } from "../../services/dataService";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Question {
  id: number;
  "main-topic": string;
  subtopic: string;
  "sub-subtopic": string;
  "main-level": number;
  sublevel: string;
  "sub-sublevel": string;
  question: string;
  answer: string;
  explanation: string;
}

interface Stats {
  count: number;
  percentage: number;
}

interface StatsMap {
  [key: string]: Stats;
}

interface StatsPanelProps {
  onClose: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainTopicsStats, setMainTopicsStats] = useState<StatsMap>({});
  const [subtopicsStats, setSubtopicsStats] = useState<StatsMap>({});
  const [subSubtopicsStats, setSubSubtopicsStats] = useState<StatsMap>({});
  const [mainLevelsStats, setMainLevelsStats] = useState<StatsMap>({});
  const [sublevelsStats, setSublevelsStats] = useState<StatsMap>({});
  const [subSublevelsStats, setSubSublevelsStats] = useState<StatsMap>({});

  const calculateStats = (
    questions: Question[],
    field: keyof Question
  ): StatsMap => {
    const total = questions.length;
    const stats: StatsMap = {};

    questions.forEach((q) => {
      const value = String(q[field]);
      if (!stats[value]) {
        stats[value] = { count: 0, percentage: 0 };
      }
      stats[value].count++;
    });

    Object.keys(stats).forEach((key) => {
      stats[key].percentage = Number(
        ((stats[key].count / total) * 100).toFixed(1)
      );
    });

    return stats;
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const questionsData = await dataService.getData("questions");

        if (questionsData && questionsData.Questions) {
          const questions = questionsData.Questions;
          setMainTopicsStats(calculateStats(questions, "main-topic"));
          setSubtopicsStats(calculateStats(questions, "subtopic"));
          setSubSubtopicsStats(calculateStats(questions, "sub-subtopic"));
          setMainLevelsStats(calculateStats(questions, "main-level"));
          setSublevelsStats(calculateStats(questions, "sublevel"));
          setSubSublevelsStats(calculateStats(questions, "sub-sublevel"));
        }
      } catch (err) {
        setError("Erreur lors du chargement des statistiques");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Statistiques</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 text-center">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Statistiques</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 text-red-500">{error}</div>
      </div>
    );
  }

  const renderStatsTable = (stats: StatsMap, title: string) => (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre de questions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pourcentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(stats).map(([key, value]) => (
              <tr key={key}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {value.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {value.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Statistiques</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Répartition par thème</h2>
          <hr />
          {renderStatsTable(mainTopicsStats, "*** Thèmes principaux ***")}
          <hr />
          {renderStatsTable(subtopicsStats, "*** Sous-thèmes ***")}
          <hr />
          {renderStatsTable(subSubtopicsStats, "*** Sous-sous-thèmes ***")}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Répartition par niveau</h2>
          <hr />
          {renderStatsTable(mainLevelsStats, "*** Niveaux principaux ***")}
          <hr />
          {renderStatsTable(sublevelsStats, "*** Sous-niveaux ***")}
          <hr />
          {renderStatsTable(subSublevelsStats, "*** Sous-sous-niveaux ***")}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
