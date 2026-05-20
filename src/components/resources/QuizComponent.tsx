import { useState, useEffect } from "react";
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

/**
 * QuizComponent renders an interactive quiz interface.
 * On completion, it calculates the user's score and awards gamification XP
 * through the AuthContext (Firestore) and GamificationContext (Toasts).
 */
export default function QuizComponent({ quizId, questions, onComplete, title = "Quiz Time" }: QuizComponentProps) {
  const { addXp } = useGamification();
  const { user, updateUserProfile } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state if quizId changes
  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
    setShowFeedback(false);
  }, [quizId]);

  const handleQuizSubmit = async () => {
    if (isSubmitting) return;
    const current = questions[currentQuestion];
    setShowFeedback(true);

    let updatedScore = score;
    if (selectedAnswer === current.answer) {
      updatedScore += 1;
      setScore(updatedScore);
    }

    setTimeout(async () => {
      setShowFeedback(false);

      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer("");
      } else {
        // Quiz completed
        setShowResult(true);
        setIsSubmitting(true);

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
              const newPoints = (user.points || 0) + pointsEarned;
              
              // Update Firestore
              await updateUserProfile({
                completedQuizzes: newQuizzes,
                points: newPoints
              });

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
          setIsSubmitting(false);
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

  if (showResult) {
    const isPerfect = score === questions.length;
    const passed = score >= Math.ceil(questions.length * 0.7);

    return (
      <div className={styles.resultContainer}>
        <h2 className={styles.resultTitle}>
          Quiz Completed <Trophy size={28} className="inline-block text-yellow-500 mb-1" />
        </h2>
        <p className={styles.resultScore}>
          Your Score: {score} / {questions.length}
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
          <button
            className={styles.retryButton}
            onClick={() => {
              setCurrentQuestion(0);
              setSelectedAnswer("");
              setScore(0);
              setShowResult(false);
            }}
          >
            Retake Quiz
          </button>
          {onComplete && (
            <button className={styles.completeButton} onClick={onComplete}>
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  const current = questions[currentQuestion];

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <h3 className={styles.quizTitle}>{title}</h3>
        <span className={styles.quizProgress}>
          Question {currentQuestion + 1} / {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
        />
      </div>

      <div className={styles.questionCard}>
        <h2 className={styles.questionText}>{current.question}</h2>

        <div className={styles.optionsContainer}>
          {current.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === current.answer;
            
            let optionClass = styles.optionButton;
            if (isSelected) optionClass += ` ${styles.selected}`;
            
            if (showFeedback) {
              if (isCorrect) optionClass += ` ${styles.correct}`;
              else if (isSelected) optionClass += ` ${styles.incorrect}`;
            }

            return (
              <button
                key={option}
                className={optionClass}
                disabled={showFeedback}
                onClick={() => setSelectedAnswer(option)}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`${styles.feedbackText} ${selectedAnswer === current.answer ? styles.feedbackCorrect : styles.feedbackIncorrect}`}>
            {selectedAnswer === current.answer ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Correct Answer <CheckCircle2 size={18} /></span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Wrong Answer <XCircle size={18} /></span>
            )}
          </div>
        )}

        <button
          className={styles.nextButton}
          disabled={!selectedAnswer || showFeedback}
          onClick={handleQuizSubmit}
        >
          {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}
