import { auth } from "./config/firebase";
console.log("Firebase Auth initialized:", !!auth);
import { dataService } from "./services/dataService";
import "./styles.css";
import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Dice1,
  Clock,
  ChevronDown,
  UserCircle,
  Save,
} from "lucide-react";
import useResizable from "./hooks/useResizable";
import { useAuth } from "./contexts/AuthContext";
import AuthManager from "./components/auth/AuthManager";
import { playerService } from "./services/playerService";
import SettingsButton from "./components/settings/SettingsButton";
import AdminPanel from "./components/admin/AdminPanel";
import StatsPanel from "./components/stats/StatsPanel";

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
  selectedAnswer?: string;
}

interface TopicStructure {
  "main-topic": string;
  subtopic: string;
  "sub-subtopic": string;
}

interface LevelStructure {
  "main-level": number;
  sublevel: string;
  "sub-sublevel": string;
}

interface QuestionFile {
  Questions: Question[];
}

interface StructureFile {
  TOPICS: TopicStructure[];
  LEVELS: LevelStructure[];
}

interface PlayerData {
  uid: string;
  name: string;
  selections: {
    mainTopics: string[];
    subTopics: string[];
    subSubTopics: string[];
    mainLevels: number[];
    subLevels: string[];
    subSubLevels: string[];
  };
}
interface PlayerScore {
  correct: number;
  total: number;
}
const QuizApp: React.FC = () => {
  const topicsRef = useRef<HTMLDivElement>(null);
  const levelsRef = useRef<HTMLDivElement>(null);
  const { initResize: initTopicsResize } = useResizable(topicsRef, "height");
  const { initResize: initLevelsResize } = useResizable(levelsRef, "height");

  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [structureData, setStructureData] = useState<{
    TOPICS: TopicStructure[];
    LEVELS: LevelStructure[];
  }>({ TOPICS: [], LEVELS: [] });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, userData } = useAuth();
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [players, setPlayers] = useState<PlayerData[]>([
    {
      uid: `player-1-${Date.now()}`,
      name: "Joueur 1",
      selections: {
        mainTopics: [],
        subTopics: [],
        subSubTopics: [],
        mainLevels: [],
        subLevels: [],
        subSubLevels: [],
      },
    },
    {
      uid: `player-2-${Date.now()}`,
      name: "Joueur 2",
      selections: {
        mainTopics: [],
        subTopics: [],
        subSubTopics: [],
        mainLevels: [],
        subLevels: [],
        subSubLevels: [],
      },
    },
    {
      uid: `player-3-${Date.now()}`,
      name: "Joueur 3",
      selections: {
        mainTopics: [],
        subTopics: [],
        subSubTopics: [],
        mainLevels: [],
        subLevels: [],
        subSubLevels: [],
      },
    },
    {
      uid: `player-4-${Date.now()}`,
      name: "Joueur 4",
      selections: {
        mainTopics: [],
        subTopics: [],
        subSubTopics: [],
        mainLevels: [],
        subLevels: [],
        subSubLevels: [],
      },
    },
    {
      uid: `player-5-${Date.now()}`,
      name: "Joueur 5",
      selections: {
        mainTopics: [],
        subTopics: [],
        subSubTopics: [],
        mainLevels: [],
        subLevels: [],
        subSubLevels: [],
      },
    },
    {
      uid: `player-6-${Date.now()}`,
      name: "Joueur 6",
      selections: {
        mainTopics: [],
        subTopics: [],
        subSubTopics: [],
        mainLevels: [],
        subLevels: [],
        subSubLevels: [],
      },
    },
  ]);

  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(0);
  const [selectedMainTopics, setSelectedMainTopics] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [selectedSubSubTopics, setSelectedSubSubTopics] = useState<string[]>(
    []
  );
  const [selectedMainLevels, setSelectedMainLevels] = useState<number[]>([]);
  const [selectedSubLevels, setSelectedSubLevels] = useState<string[]>([]);
  const [selectedSubSubLevels, setSelectedSubSubLevels] = useState<string[]>(
    []
  );
  const [randomQuestion, setRandomQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [time, setTime] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const savePlayerData = async () => {
    if (!currentUser) return;
    try {
      await playerService.savePlayers(currentUser.uid, players);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>(
    Array(players.length).fill({ correct: 0, total: 0 })
  );

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        if (currentUser) {
          const savedPlayers = await playerService.getPlayers(currentUser.uid);
          if (savedPlayers.length > 0) {
            setPlayers(savedPlayers);
            setHasUnsavedChanges(false);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des joueurs:", error);
      }
    };
    loadPlayerData();
  }, [currentUser]);

  useEffect(() => {
    const initData = async () => {
      try {
        await dataService.initialize();
        const questions = await dataService.getData("questions");
        const structure = await dataService.getData("structure");
        if (questions) setQuestionsData(questions.Questions);
        if (structure)
          setStructureData({
            TOPICS: structure.TOPICS,
            LEVELS: structure.LEVELS,
          });
      } catch (error) {
        console.error("Erreur lors du chargement des fichiers JSON :", error);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (timerRunning) {
      const id = window.setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      timerRef.current = id;
    }
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [timerRunning]);

  useEffect(() => {
    const currentPlayer = players[selectedPlayerIndex];
    setSelectedMainTopics(currentPlayer.selections.mainTopics);
    setSelectedSubTopics(currentPlayer.selections.subTopics);
    setSelectedSubSubTopics(currentPlayer.selections.subSubTopics);
    setSelectedMainLevels(currentPlayer.selections.mainLevels);
    setSelectedSubLevels(currentPlayer.selections.subLevels);
    setSelectedSubSubLevels(currentPlayer.selections.subSubLevels);
  }, [selectedPlayerIndex, players]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getUniqueOptions = (
    key: keyof TopicStructure | keyof LevelStructure,
    dataType: "topics" | "levels"
  ): (string | number)[] => {
    const data =
      dataType === "topics" ? structureData.TOPICS : structureData.LEVELS;
    return Array.from(
      new Set(
        data.map((item) => {
          const value = item[key as keyof typeof item];
          return typeof value === "string" || typeof value === "number"
            ? value
            : "";
        })
      )
    );
  };

  const resetTopics = () => {
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].selections = {
      ...updatedPlayers[selectedPlayerIndex].selections,
      mainTopics: [],
      subTopics: [],
      subSubTopics: [],
    };
    setPlayers(updatedPlayers);
    setSelectedMainTopics([]);
    setSelectedSubTopics([]);
    setSelectedSubSubTopics([]);
    setHasUnsavedChanges(true);
  };

  const resetLevels = () => {
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].selections = {
      ...updatedPlayers[selectedPlayerIndex].selections,
      mainLevels: [],
      subLevels: [],
      subSubLevels: [],
    };
    setPlayers(updatedPlayers);
    setSelectedMainLevels([]);
    setSelectedSubLevels([]);
    setSelectedSubSubLevels([]);
    setHasUnsavedChanges(true);
  };

  const handleTopicSelection = async (
    level: "mainTopics" | "subTopics" | "subSubTopics",
    selectedValues: string[]
  ) => {
    const updatedPlayers = [...players];
    const resetSelections = {
      mainTopics: [],
      subTopics: [],
      subSubTopics: [],
    };

    updatedPlayers[selectedPlayerIndex].selections = {
      ...updatedPlayers[selectedPlayerIndex].selections,
      ...resetSelections,
      [level]: selectedValues,
    };
    setPlayers(updatedPlayers);
    setHasUnsavedChanges(true);

    setSelectedMainTopics(level === "mainTopics" ? selectedValues : []);
    setSelectedSubTopics(level === "subTopics" ? selectedValues : []);
    setSelectedSubSubTopics(level === "subSubTopics" ? selectedValues : []);
  };

  const handleLevelSelection = async (
    level: "mainLevels" | "subLevels" | "subSubLevels",
    selectedValues: string[] | number[]
  ) => {
    const updatedPlayers = [...players];
    const resetSelections = {
      mainLevels: [],
      subLevels: [],
      subSubLevels: [],
    };

    updatedPlayers[selectedPlayerIndex].selections = {
      ...updatedPlayers[selectedPlayerIndex].selections,
      ...resetSelections,
      [level]: selectedValues,
    };
    setPlayers(updatedPlayers);
    setHasUnsavedChanges(true);

    setSelectedMainLevels(
      level === "mainLevels" ? (selectedValues as number[]) : []
    );
    setSelectedSubLevels(
      level === "subLevels" ? (selectedValues as string[]) : []
    );
    setSelectedSubSubLevels(
      level === "subSubLevels" ? (selectedValues as string[]) : []
    );
  };

  const handlePlayerNameChange = async (index: number, newName: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      name: newName,
      uid: updatedPlayers[index].uid || `player-${index}-${Date.now()}`,
    };
    setPlayers(updatedPlayers);
    setHasUnsavedChanges(true);
  };
  const renderAuthButton = () => {
    if (currentUser) {
      return (
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 player-name-input player-active"
        >
          <UserCircle size={18} />
          <span>{userData?.displayName || "Profil"}</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center gap-2 player-name-input"
      >
        <UserCircle size={18} />
        <span>Se connecter</span>
      </button>
    );
  };

  const getRandomQuestion = () => {
    const filteredQuestions = questionsData.filter((q) => {
      const topicMatch =
        (selectedMainTopics.length === 0 ||
          selectedMainTopics.includes(q["main-topic"])) &&
        (selectedSubTopics.length === 0 ||
          selectedSubTopics.includes(q.subtopic)) &&
        (selectedSubSubTopics.length === 0 ||
          selectedSubSubTopics.includes(q["sub-subtopic"]));

      const levelMatch =
        (selectedMainLevels.length === 0 ||
          selectedMainLevels.includes(q["main-level"])) &&
        (selectedSubLevels.length === 0 ||
          selectedSubLevels.includes(q.sublevel)) &&
        (selectedSubSubLevels.length === 0 ||
          selectedSubSubLevels.includes(q["sub-sublevel"]));

      return topicMatch && levelMatch;
    });

    if (filteredQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      setRandomQuestion(filteredQuestions[randomIndex]);
      setShowAnswer(false);
      setTime(0);
      setTimerRunning(true);
    } else {
      alert("Aucune question ne correspond aux critères sélectionnés");
    }
  };

  const getTimerClass = (time: number) => {
    const baseClass = "timer";
    if (time >= 40) return `${baseClass} text-red-500`;
    if (time >= 20) return `${baseClass} text-orange-500`;
    return `${baseClass} text-gray-700`;
  };
  const handleAnswerValidation = (isCorrect: boolean) => {
    setIsValidated(true);
    const newScores = [...playerScores];
    newScores[selectedPlayerIndex] = {
      correct: newScores[selectedPlayerIndex].correct + (isCorrect ? 1 : 0),
      total: newScores[selectedPlayerIndex].total + 1,
    };
    setPlayerScores(newScores);
  };

  const clearScores = () => {
    setPlayerScores(Array(players.length).fill({ correct: 0, total: 0 }));
  };

  const [isValidated, setIsValidated] = useState(false);

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="quiz-title mb-0">Quiz Educatif</h1>
        <div className="flex items-center gap-2">
          <SettingsButton
            onAdminClick={() => {
              setShowAuthModal(false);
              setShowAdminModal(true);
            }}
            onStatsClick={() => {
              setShowAuthModal(false);
              setShowStatsModal(true);
            }}
          />
          {renderAuthButton()}
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <AuthManager onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl mx-4">
            <AdminPanel onClose={() => setShowAdminModal(false)} />
          </div>
        </div>
      )}

      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl mx-4">
            <StatsPanel onClose={() => setShowStatsModal(false)} />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="section" ref={topicsRef}>
          <div className="section-header">
            <h2 className="section-title">Gestion des Thèmes</h2>
          </div>

          <button onClick={resetTopics} className="reset-button">
            <RotateCcw size={18} />
            <span>Réinitialiser les thèmes</span>
          </button>

          <div className="select-container">
            <label className="select-label">
              Thèmes principaux{" "}
              <ChevronDown size={14} className="inline ml-1" />
            </label>
            <select
              multiple
              value={selectedMainTopics}
              onChange={(e) => {
                const selectedValues = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleTopicSelection("mainTopics", selectedValues);
              }}
              className="resize-select"
            >
              {getUniqueOptions("main-topic", "topics").map((topic) => (
                <option key={String(topic)} value={String(topic)}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div className="select-container">
            <label className="select-label">
              Sous-thèmes <ChevronDown size={14} className="inline ml-1" />
            </label>
            <select
              multiple
              value={selectedSubTopics}
              onChange={(e) => {
                const selectedValues = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleTopicSelection("subTopics", selectedValues);
              }}
              className="resize-select"
            >
              {getUniqueOptions("subtopic", "topics").map((subtopic) => (
                <option key={String(subtopic)} value={String(subtopic)}>
                  {subtopic}
                </option>
              ))}
            </select>
          </div>

          <div className="select-container">
            <label className="select-label">
              Sous-sous-thèmes <ChevronDown size={14} className="inline ml-1" />
            </label>
            <select
              multiple
              value={selectedSubSubTopics}
              onChange={(e) => {
                const selectedValues = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleTopicSelection("subSubTopics", selectedValues);
              }}
              className="resize-select"
            >
              {getUniqueOptions("sub-subtopic", "topics").map((subSubTopic) => (
                <option key={String(subSubTopic)} value={String(subSubTopic)}>
                  {subSubTopic}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="section" ref={levelsRef}>
          <div className="section-header">
            <h2 className="section-title">Gestion des Niveaux</h2>
          </div>

          <button onClick={resetLevels} className="reset-button">
            <RotateCcw size={18} />
            <span>Réinitialiser les niveaux</span>
          </button>

          <div className="select-container">
            <label className="select-label">
              Niveaux principaux{" "}
              <ChevronDown size={14} className="inline ml-1" />
            </label>
            <select
              multiple
              value={selectedMainLevels.map(String)}
              onChange={(e) => {
                const selectedValues = Array.from(
                  e.target.selectedOptions,
                  (option) => parseInt(option.value)
                );
                handleLevelSelection("mainLevels", selectedValues);
              }}
              className="resize-select"
            >
              {getUniqueOptions("main-level", "levels").map((level) => (
                <option key={String(level)} value={String(level)}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="select-container">
            <label className="select-label">
              Sous-niveaux <ChevronDown size={14} className="inline ml-1" />
            </label>
            <select
              multiple
              value={selectedSubLevels}
              onChange={(e) => {
                const selectedValues = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleLevelSelection("subLevels", selectedValues);
              }}
              className="resize-select"
            >
              {getUniqueOptions("sublevel", "levels").map((sublevel) => (
                <option key={String(sublevel)} value={String(sublevel)}>
                  {sublevel}
                </option>
              ))}
            </select>
          </div>

          <div className="select-container">
            <label className="select-label">
              Sous-sous-niveaux{" "}
              <ChevronDown size={14} className="inline ml-1" />
            </label>
            <select
              multiple
              value={selectedSubSubLevels}
              onChange={(e) => {
                const selectedValues = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleLevelSelection("subSubLevels", selectedValues);
              }}
              className="resize-select"
            >
              {getUniqueOptions("sub-sublevel", "levels").map((subSubLevel) => (
                <option key={String(subSubLevel)} value={String(subSubLevel)}>
                  {subSubLevel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Joueurs</h3>
            {currentUser && hasUnsavedChanges && (
              <button onClick={savePlayerData} className="save-button">
                <Save size={18} />
                <span>Enregistrer</span>
              </button>
            )}
          </div>
          <div className="players-grid mb-4">
            {players.map((player, index) => (
              <div key={index} className="player-option">
                <input
                  type="radio"
                  id={`player-${index}`}
                  name="playerSelect"
                  checked={selectedPlayerIndex === index}
                  onChange={() => setSelectedPlayerIndex(index)}
                  className="hidden"
                />
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) =>
                    handlePlayerNameChange(index, e.target.value)
                  }
                  className={`player-name-input ${
                    selectedPlayerIndex === index ? "player-active" : ""
                  }`}
                  onClick={() => setSelectedPlayerIndex(index)}
                  aria-label={`Nom du joueur ${index + 1}`}
                />
              </div>
            ))}
          </div>
          {questionsData.length > 0 &&
            structureData.TOPICS.length > 0 &&
            structureData.LEVELS.length > 0 && (
              <button
                onClick={getRandomQuestion}
                className="question-random-button"
              >
                <Dice1 className="w-4 h-4" />
                <span>Question Aléatoire</span>
              </button>
            )}
        </div>

        {randomQuestion && (
          <div className="question-card">
            <div className="question-header">
              <h2 className="question-title">Question</h2>
              {timerRunning && (
                <div className={getTimerClass(time)}>
                  <Clock size={18} />
                  {formatTime(time)}
                </div>
              )}
            </div>

            <div className="question-meta">
              ({randomQuestion["sub-subtopic"]}, niveau{" "}
              {randomQuestion["sub-sublevel"]}, pour{" "}
              {players[selectedPlayerIndex].name})
            </div>

            <p className="question-text">{randomQuestion.question}</p>

            <button
              onClick={() => {
                setShowAnswer(!showAnswer);
                if (!showAnswer) {
                  setTimerRunning(false);
                  setIsValidated(false);
                }
              }}
              className="answer-button"
            >
              {showAnswer ? "Masquer la réponse" : "Voir la réponse"}
            </button>

            {showAnswer && (
              <div className="answer-section">
                <div className="answer-content">
                  <h3 className="answer-title">Réponse</h3>
                  <p>{randomQuestion.answer}</p>
                  {randomQuestion.explanation && (
                    <div className="explanation">
                      <h3 className="answer-title">Explication</h3>
                      <p>{randomQuestion.explanation}</p>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleAnswerValidation(true)}
                          className="validation-button-success"
                          disabled={isValidated}
                        >
                          Validé ✓
                        </button>
                        <button
                          onClick={() => handleAnswerValidation(false)}
                          className="validation-button-danger"
                          disabled={isValidated}
                        >
                          Non validé ✗
                        </button>
                      </div>

                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-3">SCORES</h3>
                        <div className="space-y-2">
                          {players.map((player, index) => (
                            <div key={player.uid}>
                              {player.name} : {playerScores[index].correct} (
                              {playerScores[index].total > 0
                                ? Math.round(
                                    (playerScores[index].correct /
                                      playerScores[index].total) *
                                      100
                                  )
                                : 0}
                              %)
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={clearScores}
                          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          CLEAR ALL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizApp;
