export interface GradableQuestion {
  _id?: any;
  text: string;
  options: string[];
  correctIndex?: number;
  correctIndices?: number[];
  isMultiple?: boolean;
  explanation?: string;
}

export interface QuestionBreakdown {
  questionId: string;
  selectedIndex?: number;
  selectedIndices?: number[];
  correctIndex?: number;
  correctIndices?: number[];
  isCorrect: boolean;
  explanation?: string;
}

export interface GradingResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  breakdown: QuestionBreakdown[];
}

export function gradeQuestions(
  questions: GradableQuestion[],
  answers: (number | number[])[],
  passingScore: number = 70,
): GradingResult {
  let correctCount = 0;

  const breakdown: QuestionBreakdown[] = questions.map((question, index) => {
    const ans = answers[index];
    const isMulti = question.isMultiple || Array.isArray(question.correctIndices);

    let isCorrect = false;
    let selectedIndex: number | undefined = undefined;
    let selectedIndices: number[] | undefined = undefined;
    const correctIndex: number | undefined = question.correctIndex;
    const correctIndices: number[] | undefined = question.correctIndices;

    if (isMulti) {
      selectedIndices = Array.isArray(ans)
        ? [...ans].map(Number).sort()
        : typeof ans === 'number'
        ? [ans]
        : [];
      const expected = (
        question.correctIndices || (question.correctIndex !== undefined ? [question.correctIndex] : [])
      ).slice().sort();

      isCorrect =
        selectedIndices.length === expected.length &&
        selectedIndices.every((val, i) => val === expected[i]);
    } else {
      selectedIndex = typeof ans === 'number' ? ans : Array.isArray(ans) && ans.length > 0 ? ans[0] : -1;
      isCorrect = selectedIndex !== -1 && selectedIndex === question.correctIndex;
    }

    if (isCorrect) correctCount++;

    return {
      questionId: question._id ? question._id.toString() : index.toString(),
      selectedIndex,
      selectedIndices,
      correctIndex,
      correctIndices,
      isCorrect,
      explanation: question.explanation,
    };
  });

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= passingScore;

  return {
    score,
    correctCount,
    totalQuestions,
    passed,
    breakdown,
  };
}
