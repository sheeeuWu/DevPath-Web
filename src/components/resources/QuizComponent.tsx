import { useEffect, useReducer, useRef } from "react";
import confetti from "canvas-confetti";
import { Trophy, Zap, Target, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import styles from "./QuizComponent.module.css";
import { useGamification } from "../../context/GamificationContext";
import { useAuth } from "../../context/AuthContext";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface QuizComponentProps {
  quizId: string;
  questions: QuizQuestion[];
  onComplete?: () => void;
  title?: string;
}

type QuizState = {
  currentQuestion: number;
  selectedAnswer: string;
  score: number;
  showResult: boolean;
  showFeedback: boolean;
};

type QuizAction =
  | { type: "reset" }
  | { type: "selectAnswer"; answer: string }
  | { type: "submitAnswer"; isCorrect: boolean }
  | { type: "nextQuestion" }
  | { type: "completeQuiz" };

const initialQuizState: QuizState = {
  currentQuestion: 0,
  selectedAnswer: "",
  score: 0,
  showResult: false,
  showFeedback: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "reset":
      return initialQuizState;
    case "selectAnswer":
      return {
        ...state,
        selectedAnswer: action.answer,
      };
    case "submitAnswer":
      return {
        ...state,
        score: action.isCorrect ? state.score + 1 : state.score,
        showFeedback: true,
      };
    case "nextQuestion":
      return {
        ...state,
        currentQuestion: state.currentQuestion + 1,
        selectedAnswer: "",
        showFeedback: false,
      };
    case "completeQuiz":
      return {
        ...state,
        showFeedback: false,
        showResult: true,
      };
    default:
      return state;
  }
}

/**
 * QuizComponent renders an interactive quiz interface.
 * On completion, it calculates the user's score and awards gamification XP
 * through the AuthContext (Firestore) and GamificationContext (Toasts).
 */
export default function QuizComponent({ quizId, questions, onComplete, title = "Quiz Time" }: QuizComponentProps) {
  const { addXp } = useGamification();
  const { user, updateUserProfile, awardPoints } = useAuth();

  const [quizState, dispatchQuiz] = useReducer(quizReducer, initialQuizState);
  const isSubmittingRef = useRef(false);

  // Ref to track the in-flight feedback timer so it can be cancelled on unmount
  // or when the user switches quizzes mid-delay.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state safely if quizId changes and cancel any pending timer
  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    dispatchQuiz({ type: "reset" });
    isSubmittingRef.current = false;
  }, [quizId]); // Ensure dependency array balances tracking transitions cleanly


  // Cancel the timer on component unmount to prevent stale state updates
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleQuizSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    const questionIndex = quizState.currentQuestion;
    const current = questions[questionIndex];
    const isCorrect = quizState.selectedAnswer === current.answer;
    const updatedScore = quizState.score + (isCorrect ? 1 : 0);
    const isLastQuestion = questionIndex + 1 >= questions.length;

    dispatchQuiz({ type: "submitAnswer", isCorrect });

    timerRef.current = setTimeout(async () => {
      timerRef.current = null;

      if (!isLastQuestion) {
        dispatchQuiz({ type: "nextQuestion" });
        isSubmittingRef.current = false;
      } else {
        // Quiz completed
        dispatchQuiz({ type: "completeQuiz" });

        const isPerfect = updatedScore === questions.length;
        const passed = updatedScore >= Math.ceil(questions.length * 0.7);

        if (isPerfect) {
          triggerConfetti();
        }

        try {
          if (user && user.email !== "devpathind.community@gmail.com") {
            const completed = user.completedQuizzes || [];

            // Only award XP if not already completed and passed
            if (!completed.includes(quizId) && passed) {
              const newQuizzes = [...completed, quizId];
              const pointsEarned = isPerfect ? 350 : 200;

              // Update quiz progress (non-point fields)
              await updateUserProfile({ completedQuizzes: newQuizzes });

              // Award XP atomically (also keeps leaderboard in sync)
              await awardPoints(pointsEarned);

              // Firestore already received the points update above; this call only shows feedback.
              addXp(
                pointsEarned,
                isPerfect ? "Perfect Quiz Score!" : "Passed Quiz Successfully!",
                "xp",
                { persist: false }
              );
            }
          } else if (!user) {
            // For unauthenticated testing
            if (isPerfect) addXp(350, "Perfect Quiz Score!");
            else if (passed) addXp(200, "Passed Quiz Successfully!");
          }
        } catch (error) {
          console.error("Failed to update quiz progress:", error);
        } finally {
          isSubmittingRef.current = false;
        }
      }
    }, 1200);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  if (quizState.showResult) {
    const isPerfect = quizState.score === questions.length;
    const passed = quizState.score >= Math.ceil(questions.length * 0.7);

    return (
      <div className={styles.resultContainer}>
        <h2 className={styles.resultTitle}>
          Quiz Completed <Trophy size={28} className="inline-block text-yellow-500 mb-1" />
        </h2>
        <p className={styles.resultScore}>
          Your Score: {quizState.score} / {questions.length}
        </p>

        {isPerfect ? (
          <p className={styles.perfectFeedback}>
            Perfect Score! +350 XP <Zap size={20} className="inline-block text-emerald-500 mb-1" />
          </p>
        ) : passed ? (
          <p className={styles.passedFeedback}>
            Great Job! +200 XP <Target size={20} className="inline-block text-primary mb-1" />
          </p>
        ) : (
          <p className={styles.failedFeedback}>
            Keep Practicing <Lightbulb size={20} className="inline-block text-yellow-500 mb-1" />
          </p>
        )}

        <div className={styles.actionButtons}>
          <button aria-label="Action button" 
            className={styles.retryButton}
            onClick={() => {
              dispatchQuiz({ type: "reset" });
            }}
          >
            Retake Quiz
          </button>
          {onComplete && (
            <button aria-label="Action button"  className={styles.completeButton} onClick={onComplete}>
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  const current = questions[quizState.currentQuestion];

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <h3 className={styles.quizTitle}>{title}</h3>
        <span className={styles.quizProgress}>
          Question {quizState.currentQuestion + 1} / {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${((quizState.currentQuestion) / questions.length) * 100}%` }}
        />
      </div>

      <div className={styles.questionCard}>
        <h2 className={styles.questionText}>{current.question}</h2>

        <div className={styles.optionsContainer}>
          {current.options.map((option) => {
            const isSelected = quizState.selectedAnswer === option;
            const isCorrect = option === current.answer;
            
            let optionClass = styles.optionButton;
            if (isSelected) optionClass += ` ${styles.selected}`;
            
            if (quizState.showFeedback) {
              if (isCorrect) optionClass += ` ${styles.correct}`;
              else if (isSelected) optionClass += ` ${styles.incorrect}`;
            }

            return (
              <button aria-label="Action button" 
                key={option}
                className={optionClass}
                disabled={quizState.showFeedback}
                onClick={() => dispatchQuiz({ type: "selectAnswer", answer: option })}
              >
                {option}
              </button>
            );
          })}
        </div>

        {quizState.showFeedback && (
          <div className={`${styles.feedbackText} ${quizState.selectedAnswer === current.answer ? styles.feedbackCorrect : styles.feedbackIncorrect}`}>
            {quizState.selectedAnswer === current.answer ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Correct Answer <CheckCircle2 size={18} /></span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Wrong Answer <XCircle size={18} /></span>
            )}
          </div>
        )}

        <button aria-label="Action button" 
          className={styles.nextButton}
          disabled={!quizState.selectedAnswer || quizState.showFeedback}
          onClick={handleQuizSubmit}
        >
          {quizState.currentQuestion === questions.length - 1 ? "Finish Quiz" : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}
