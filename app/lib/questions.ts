import type { PracticeMode, ChallengeType, Question, EquationChoice } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeChoices(dividend: number, divisor: number, quotient: number): EquationChoice[] {
  const correct: EquationChoice = { dividend, divisor };
  const others = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(q => q !== quotient)).slice(0, 3);
  const wrong: EquationChoice[] = others.map(q => ({ dividend: divisor * q, divisor }));
  return shuffle([correct, ...wrong]);
}

export function makePracticeQuestions(dan: number, mode: PracticeMode): Question[] {
  let qs: Question[] = [];
  for (let f = 1; f <= 9; f++) {
    qs.push({ dividend: dan * f, divisor: dan, correctAnswer: f, displayType: "normal" });
  }
  if (mode === "kudari") qs.reverse();
  if (mode === "barabara") qs = shuffle(qs);
  return qs;
}

function dansByRank(rank: number): number[] {
  switch (rank) {
    case 1: return [1, 2, 3];
    case 2: return [2, 3, 4, 5];
    case 3: return [4, 5, 6, 7];
    case 4: return [6, 7, 8, 9];
    case 5: return [1, 2, 3, 4, 5, 6, 7, 8, 9];
    default: return [1, 2, 3];
  }
}

function questionCount(rank: number): number {
  return ([0, 10, 12, 15, 18, 27] as const)[rank] ?? 10;
}

export function makeChallengeQuestions(challengeType: ChallengeType, rank: number): Question[] {
  const dans = dansByRank(rank);
  let pool: Question[] = [];

  for (const dan of dans) {
    for (let f = 1; f <= 9; f++) {
      const dividend = dan * f;
      const divisor = dan;
      const quotient = f;

      if (challengeType === "answer-first") {
        const choices = makeChoices(dividend, divisor, quotient);
        const idx = choices.findIndex(c => c.dividend === dividend && c.divisor === divisor);
        pool.push({
          dividend, divisor,
          correctAnswer: idx,
          displayType: "answer-first",
          choices,
          displayAnswer: quotient,
        });
      } else if (challengeType === "mushikui") {
        pool.push({
          dividend, divisor,
          correctAnswer: dividend,
          displayType: "mushikui",
        });
      } else if (challengeType === "block") {
        pool.push({ dividend, divisor, correctAnswer: quotient, displayType: "block" });
      } else {
        pool.push({ dividend, divisor, correctAnswer: quotient, displayType: "normal" });
      }
    }
  }

  return shuffle(pool).slice(0, questionCount(rank));
}
