export class DeskError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const reportPattern = /^[0-9a-f]{64}$/;
type ObjectValue = Record<string, unknown>;
export function exact(value: unknown, keys: string[]): ObjectValue {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    !keys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
  )
    throw new DeskError(400, 'This request does not match the selected action.');
  return value as ObjectValue;
}
export function text(value: unknown, max = 20000): string {
  if (typeof value !== 'string' || [...value].length > max)
    throw new DeskError(400, 'The text is missing or too long.');
  return value;
}
export function number(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
    throw new DeskError(400, 'The position or quantity is invalid.');
  return value;
}
export function revision(value: unknown): number {
  const result = number(value, 0, 1000000000);
  if (!Number.isInteger(result)) throw new DeskError(400, 'A saved revision is required.');
  return result;
}
export function day(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.slice(0, 4) === '0000'
  )
    throw new DeskError(400, 'Choose a calendar date.');
  const parsed = new Date(value + 'T12:00:00Z');
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value)
    throw new DeskError(400, 'Choose a valid calendar date.');
  return value;
}
export function emptyState() {
  return {
    cards: [],
    layout: { analyst: [-370, 25, 20], quant: [330, -65, -80], coach: [210, 160, 40] },
    camera: { rx: -6, ry: -9, zoom: 1 },
    capture: '',
  };
}
export function validateState(value: unknown): ObjectValue {
  const state = exact(value, ['cards', 'layout', 'camera', 'capture']);
  const position = (value: unknown) => {
    if (!Array.isArray(value) || value.length !== 3)
      throw new DeskError(400, 'A card needs three coordinates.');
    value.forEach((v) => number(v, -1600, 1600));
  };
  if (!Array.isArray(state.cards) || state.cards.length > 80)
    throw new DeskError(400, 'Keep up to 80 thoughts per day.');
  let length = [...text(state.capture)].length;
  const ids = new Set<string>();
  for (const value of state.cards) {
    const card = exact(value, ['id', 'raw', 'source', 'filename', 'position']);
    if (typeof card.id !== 'string' || !uuidPattern.test(card.id) || ids.has(card.id))
      throw new DeskError(400, 'Thought identities must be unique.');
    ids.add(card.id);
    length += [...text(card.raw)].length;
    if (typeof card.source !== 'string' || !['typed', 'voice', 'drop'].includes(card.source))
      throw new DeskError(400, 'Choose a capture source.');
    if (card.filename !== null) text(card.filename, 250);
    position(card.position);
  }
  if (length > 200000)
    throw new DeskError(
      400,
      'Keep the day under 200,000 characters. Export your notes before reducing it.',
    );
  Object.values(exact(state.layout, ['analyst', 'quant', 'coach'])).forEach(position);
  const camera = exact(state.camera, ['rx', 'ry', 'zoom']);
  number(camera.rx, -35, 35);
  number(camera.ry, -35, 35);
  number(camera.zoom, 0.45, 1.4);
  return state;
}
export function draftInput(value: unknown) {
  const input = exact(value, [
    'instrument',
    'notes',
    'sources',
    'direction',
    'entry_zone',
    'invalidation',
  ]);
  const instrument = text(input.instrument, 100),
    notes = text(input.notes);
  if (
    !instrument.trim() ||
    !notes.trim() ||
    !Array.isArray(input.sources) ||
    input.sources.length ||
    !['', 'long_call', 'long_put'].includes(String(input.direction))
  )
    throw new DeskError(400, 'Review the captured thought before confirming.');
  return {
    instrument,
    notes,
    sources: [],
    direction: text(input.direction, 20),
    entry_zone: text(input.entry_zone, 120),
    invalidation: text(input.invalidation, 120),
  };
}
