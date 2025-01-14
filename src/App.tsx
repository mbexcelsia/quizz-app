import { auth } from "./config/firebase";
import { dataService } from "./services/dataService";
import "./styles.css";
import AdminPanel from "./components/admin/AdminPanel";
import AuthManager from "./components/auth/AuthManager";
import ToggleButton from "./components/common/ToggleButton";
import AiAssistantLink from "./components/common/AiAssistantLink";
import SelectionDisplay from "./components/settings/SelectionDisplay";
import SettingsButton from "./components/settings/SettingsButton";
import StatsPanel from "./components/stats/StatsPanel";
import { useAuth } from "./contexts/AuthContext";
import useResizable from "./hooks/useResizable";
import { playerService } from "./services/playerService";
import {
  RotateCcw,
  Dice1,
  Clock,
  ChevronDown,
  UserCircle,
  Save,
} from "lucide-react";

import InstallButton from "./components/install/installButton";
import React, { useState, useEffect, useRef } from "react";

console.log("Firebase Auth initialized:", !!auth);

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
interface AiLinkProps {
  question: string;
  type: "perplexity" | "claude" | "gemini"; // Ajout de 'gemini'
  className?: string;
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
  const [namesEditable, setNamesEditable] = useState<boolean>(false);

  const questionCardRef = useRef<HTMLDivElement>(null);
  const answerSectionRef = useRef<HTMLDivElement>(null);
  const playersGridRef = useRef<HTMLDivElement>(null);
  const [themePanelExpanded, setThemePanelExpanded] = useState(true);
  const [levelPanelExpanded, setLevelPanelExpanded] = useState(true);

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

  const handlePlayerSelection = (index: number) => {
    if (selectedPlayerIndex !== index) {
      // Si une question est en cours avec chronomètre actif
      if (randomQuestion && timerRunning) {
        setShowAnswer(true); // Force l'affichage de la réponse
        setTimerRunning(false); // Arrête le chronomètre
        setIsValidated(false); // Réinitialise la validation
      }

      // Réinitialiser la question
      setRandomQuestion(null); // Ajouter cette ligne pour réinitialiser la question

      setSelectedPlayerIndex(index);
    }
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
      // Ajout du scroll
      setTimeout(() => {
        questionCardRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
      <div className="flex justify-between items-center">
        {" "}
        {/* Retrait de mb-6 car géré par header-container */}
        <div className="header-container">
          <img
            src={`${process.env.PUBLIC_URL}/icons/app-logo.png`}
            alt="Quiz Educatif Logo"
            className="header-logo"
          />
          <h1 className="quiz-title">Quiz Éducatif</h1>
        </div>
        <div className="flex items-center gap-2">
          <InstallButton />
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
        <div
          className={`section ${
            !themePanelExpanded ? "section-collapsed" : ""
          }`}
          ref={topicsRef}
        >
          <div className="section-header">
            <h2 className="section-title">Gestion des Thèmes</h2>
            <ToggleButton
              isExpanded={themePanelExpanded}
              onClick={() => setThemePanelExpanded(!themePanelExpanded)}
            />
          </div>
          <div className="section-content">
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
              <SelectionDisplay
                selections={selectedMainTopics}
                className="selection-display-mobile"
              />
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
              <SelectionDisplay
                selections={selectedSubTopics}
                className="selection-display-mobile"
              />
            </div>

            <div className="select-container">
              <label className="select-label">
                Sous-sous-thèmes{" "}
                <ChevronDown size={14} className="inline ml-1" />
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
                {getUniqueOptions("sub-subtopic", "topics").map(
                  (subSubTopic) => (
                    <option
                      key={String(subSubTopic)}
                      value={String(subSubTopic)}
                    >
                      {subSubTopic}
                    </option>
                  )
                )}
              </select>
              <SelectionDisplay
                selections={selectedSubSubTopics}
                className="selection-display-mobile"
              />
            </div>
          </div>
        </div>

        <div
          className={`section ${
            !levelPanelExpanded ? "section-collapsed" : ""
          }`}
          ref={levelsRef}
        >
          <div className="section-header">
            <h2 className="section-title">Gestion des Niveaux</h2>
            <ToggleButton
              isExpanded={levelPanelExpanded}
              onClick={() => setLevelPanelExpanded(!levelPanelExpanded)}
            />
          </div>
          <div className="section-content">
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
              <SelectionDisplay
                selections={selectedMainLevels.map(String)}
                className="selection-display-mobile"
              />
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
              <SelectionDisplay
                selections={selectedSubLevels}
                className="selection-display-mobile"
              />
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
                {getUniqueOptions("sub-sublevel", "levels").map(
                  (subSubLevel) => (
                    <option
                      key={String(subSubLevel)}
                      value={String(subSubLevel)}
                    >
                      {subSubLevel}
                    </option>
                  )
                )}
              </select>
              <SelectionDisplay
                selections={selectedSubSubLevels}
                className="selection-display-mobile"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div>
          {/* En-tête avec le titre */}
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium mb-4">Joueurs</h3>
            {currentUser && hasUnsavedChanges && (
              <button onClick={savePlayerData} className="save-button">
                <Save size={18} />
                <span>Enregistrer</span>
              </button>
            )}
          </div>

          {/* Case à cocher séparée */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={namesEditable}
                onChange={(e) => setNamesEditable(e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
              />
              Noms modifiables
            </label>
            <hr className="border-t border-gray-200 w-full my-4" />{" "}
            {/* Ajout de la ligne horizontale */}
          </div>

          {/* Section des joueurs */}
          <div className="players-grid mb-4" ref={playersGridRef}>
            {players.map((player, index) => (
              <div key={index} className="player-option">
                <input
                  type="radio"
                  id={`player-${index}`}
                  name="playerSelect"
                  checked={selectedPlayerIndex === index}
                  onChange={() => handlePlayerSelection(index)}
                  className="hidden"
                />
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) =>
                    namesEditable &&
                    handlePlayerNameChange(index, e.target.value)
                  }
                  className={`player-name-input ${
                    selectedPlayerIndex === index
                      ? `player-${index + 1}-active`
                      : ""
                  } ${!namesEditable ? "cursor-pointer" : "cursor-text"}`}
                  onClick={() => handlePlayerSelection(index)}
                  readOnly={!namesEditable}
                  aria-label={`Nom du joueur ${index + 1}`}
                />
              </div>
            ))}
          </div>
          {questionsData.length > 0 &&
            structureData.TOPICS.length > 0 &&
            structureData.LEVELS.length > 0 && (
              <button onClick={getRandomQuestion} className="random-button">
                <Dice1 className="w-4 h-4" />
                <span>Question Aléatoire</span>
              </button>
            )}
        </div>

        {randomQuestion && (
          <div
            className={`question-card ${
              !showAnswer
                ? `question-card-player-${selectedPlayerIndex + 1}`
                : ""
            }`}
            ref={questionCardRef}
          >
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
              {randomQuestion["sub-sublevel"]})
            </div>

            <p className="question-text">{randomQuestion.question}</p>

            <button
              onClick={() => {
                setShowAnswer(!showAnswer);
                if (!showAnswer) {
                  setTimerRunning(false);
                  setIsValidated(false);
                  setTimeout(() => {
                    answerSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 100);
                } else {
                  setTimeout(() => {
                    playersGridRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 100);
                }
              }}
              className="answer-button"
            >
              {showAnswer ? "Masquer la réponse" : "Voir la réponse"}
            </button>

            {showAnswer && (
              <div className="answer-section" ref={answerSectionRef}>
                <div className="answer-content">
                  <h3 className="answer-title">Réponse</h3>
                  <p>{randomQuestion.answer}</p>
                  {randomQuestion.explanation && (
                    <div className="explanation">
                      <h3 className="answer-title">Explication</h3>
                      <p>{randomQuestion.explanation}</p>

                      {/* Ajout des liens AI Assistant */}
                      <div className="flex justify-center mt-6 mb-6">
                        <AiAssistantLink question={randomQuestion.question} />
                      </div>

                      <div className="validation-buttons-container">
                        <button
                          onClick={() => handleAnswerValidation(true)}
                          className="validation-button-success"
                          disabled={isValidated}
                        >
                          Validé ?
                        </button>
                        <button
                          onClick={() => handleAnswerValidation(false)}
                          className="validation-button-danger"
                          disabled={isValidated}
                        >
                          Non validé ?
                        </button>
                      </div>

                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">
                            Tableau des Scores
                          </h3>
                          <button
                            onClick={clearScores}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                          >
                            Réinitialiser les scores
                          </button>
                        </div>
                        {/* Ajouter un div pour le saut de ligne */}
                        <div className="mb-4">&nbsp;</div>
                        <div className="overflow-x-auto scores-container">
                          <table className="w-full bg-white scores-table">
                            <thead className="bg-gray-100 border-b-2 border-gray-200">
                              <tr>
                                {/* Colonne Joueur - réduite sur mobile */}
                                <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                  Joueur
                                </th>
                                {/* Colonne Score - réduite sur mobile */}
                                <th className="px-2 md:px-6 py-2 md:py-3 text-center text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                  Score
                                </th>
                                {/* Total - caché sur mobile */}
                                <th className="hidden md:table-cell px-6 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                  Total
                                </th>
                                {/* Pourcentage - caché sur mobile */}
                                <th className="hidden md:table-cell px-6 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                  %
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {players.map((player, index) => (
                                <tr
                                  key={player.uid}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  {/* Colonne Joueur - réduite sur mobile */}
                                  <td className="px-2 md:px-6 py-2 md:py-4">
                                    <div
                                      className="w-full h-full"
                                      style={{
                                        backgroundColor: `${
                                          index === 0
                                            ? "rgba(255, 183, 3, 0.1)"
                                            : `var(--player-${
                                                index + 1
                                              }-color-light)`
                                        }`,
                                        borderLeft: `4px solid var(--player-${
                                          index + 1
                                        }-color)`,
                                        padding: "0.5rem",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {player.name}
                                    </div>
                                  </td>
                                  {/* Colonne Score - réduite sur mobile */}
                                  <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                                    <span className="score-column">
                                      {playerScores[index].correct}
                                    </span>
                                  </td>
                                  {/* Total - caché sur mobile */}
                                  <td className="hidden md:table-cell px-6 py-4 text-center text-gray-600">
                                    {playerScores[index].total}
                                  </td>
                                  {/* Pourcentage - caché sur mobile */}
                                  <td className="hidden md:table-cell px-6 py-4 text-center">
                                    <span className="font-medium">
                                      {playerScores[index].total > 0
                                        ? Math.round(
                                            (playerScores[index].correct /
                                              playerScores[index].total) *
                                              100
                                          )
                                        : 0}
                                      %
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <hr className="my-6 border-t border-gray-200" />
                      <div className="mt-12 text-center">
                        <button
                          onClick={() => setShowAnswer(false)}
                          className="answer-button"
                        >
                          Masquer la réponse
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
