export type Recovery = { filename: string; text: string };

function validRecovery(value: unknown): Recovery | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<Recovery>;
  if (
    typeof candidate.text !== 'string' ||
    candidate.text.length > 2000000 ||
    typeof candidate.filename !== 'string' ||
    !/^xiv-desk-[0-9]{4}-[0-9]{2}-[0-9]{2}-recovery\.txt$/.test(candidate.filename)
  )
    return null;
  return { filename: candidate.filename, text: candidate.text };
}

const sameRecovery = (left: Recovery, right: Recovery) =>
  left.filename === right.filename && left.text === right.text;

/** Null, invalid and repeated messages never replace recoveries already held in this tab. */
export function appendRecovery(current: Recovery[], incoming: unknown): Recovery[] {
  const snapshot = validRecovery(incoming);
  if (!snapshot || current.some((item) => sameRecovery(item, snapshot))) return current;
  return [...current, snapshot];
}

/** Call only after the user explicitly chooses to discard this particular snapshot. */
export function discardRecovery(current: Recovery[], snapshot: Recovery): Recovery[] {
  return current.filter((item) => !sameRecovery(item, snapshot));
}
