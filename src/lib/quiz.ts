/**
 * "Find your west coast village": three questions, each answer pointing to
 * the areas it fits. Every link between an answer and an area comes from
 * what the area pages themselves say (content/areas), not from opinion:
 * e.g. surf → Tamarin (its bay's surf breaks), kitesurfing → Le Morne,
 * boats to the islands → La Gaulette, cooler air → Chamarel.
 */

export const quizQuestions = [
  {
    id: "sea",
    options: [
      // Flic en Flac: one of the longest beaches; Le Morne: some of the
      // finest beaches in Mauritius.
      { id: "beach", areas: ["flic-en-flac", "le-morne"] },
      // Tamarin: surf breaks; Le Morne: kitesurfing waters; La Gaulette:
      // kitesurfers head out from here.
      { id: "surf", areas: ["tamarin", "le-morne", "la-gaulette"] },
      // Black River: base for big game fishing; La Gaulette: boats to the
      // islands.
      { id: "boats", areas: ["black-river", "la-gaulette"] },
      // Chamarel: a plateau 260 metres up with cooler air.
      { id: "hills", areas: ["chamarel"] },
    ],
  },
  {
    id: "pace",
    options: [
      // Flic en Flac: lively at weekends; Black River: the working heart
      // of the coast.
      { id: "lively", areas: ["flic-en-flac", "black-river"] },
      // Tamarin: a village people live in; La Gaulette: small, unhurried.
      { id: "village", areas: ["tamarin", "la-gaulette"] },
      // Chamarel: wooded plateau; Le Morne: the mountain and its lagoon.
      { id: "nature", areas: ["chamarel", "le-morne"] },
    ],
  },
  {
    id: "sunday",
    options: [
      // Black River is the gateway to the national park; Chamarel sits by
      // it.
      { id: "hike", areas: ["black-river", "chamarel"] },
      // Tamarin: dolphins in the bay early in the morning.
      { id: "dolphins", areas: ["tamarin"] },
      // Flic en Flac: Mauritian families picnic on the beach at weekends.
      { id: "picnic", areas: ["flic-en-flac"] },
      // La Gaulette: boats to Île aux Bénitiers and the Crystal Rock.
      { id: "island", areas: ["la-gaulette"] },
      // Le Morne Brabant: the UNESCO listed mountain.
      { id: "mountain", areas: ["le-morne"] },
    ],
  },
] as const;

export type QuizAnswers = Partial<Record<string, string>>;

/**
 * The best matching area: one point per answer that fits it. Ties go to the
 * area listed first in `order` (north to south), so the result is stable.
 */
export function quizResult(answers: QuizAnswers, order: readonly string[]) {
  const score = new Map(order.map((slug) => [slug, 0]));
  for (const question of quizQuestions) {
    const chosen = question.options.find((o) => o.id === answers[question.id]);
    for (const slug of chosen?.areas ?? []) {
      if (score.has(slug)) score.set(slug, score.get(slug)! + 1);
    }
  }
  let best = order[0];
  for (const slug of order)
    if (score.get(slug)! > score.get(best)!) best = slug;
  return best;
}
