// Starter curriculum for a beginner's empty Technique Journal — real,
// well-known white-belt fundamentals grouped by position. Descriptions are
// deliberately high-level (not step-by-step instruction) since the actual
// teaching comes from a video once one gets mapped to resource_url later.
export interface FundamentalSeed {
  name: string;
  position: string;
  description: string;
}

export const FUNDAMENTALS_SEED: FundamentalSeed[] = [
  {
    name: 'Scissor Sweep',
    position: 'Guard',
    description:
      'Classic closed-guard sweep: break their posture, control a sleeve and collar, then scissor your legs to off-balance and roll them over.',
  },
  {
    name: 'Hip Bump Sweep',
    position: 'Guard',
    description:
      'From closed guard, post up and bump your hips into theirs to knock them backward while you come up on top.',
  },
  {
    name: 'Armbar from Guard',
    position: 'Submissions',
    description:
      'From closed guard, swivel your hips to bring a leg over their head and extend their arm across your hips to hyperextend the elbow.',
  },
  {
    name: 'Triangle Choke',
    position: 'Submissions',
    description:
      'Isolate one of their arms across your body, trap their head and the other arm between your legs, then lock the triangle to finish.',
  },
  {
    name: 'Kimura',
    position: 'Submissions',
    description:
      'A figure-four shoulder lock on a bent arm — usable from guard, side control, or mount to force a tap or create a sweep/pass opportunity.',
  },
  {
    name: 'Cross Collar Choke',
    position: 'Submissions',
    description:
      'From mount or guard, cross-grip both collars deep behind the neck and squeeze the elbows in to cut off blood flow.',
  },
  {
    name: 'Americana',
    position: 'Submissions',
    description:
      'A shoulder lock applied from mount or side control by pinning the arm in a right-angle "keylock" position and rotating.',
  },
  {
    name: 'Rear Naked Choke',
    position: 'Submissions',
    description:
      'The highest-percentage finish in the sport — from back control, sink an arm under the chin and lock your hands behind the head.',
  },
  {
    name: 'Mount Escape (Upa / Bridge and Roll)',
    position: 'Escapes',
    description:
      'Trap an arm and leg on one side, bridge explosively, and roll them over into your guard.',
  },
  {
    name: 'Hip Escape (Shrimping)',
    position: 'Escapes',
    description:
      'The foundational escape movement — shrimp your hips away to create space and rebuild guard from side control or mount.',
  },
  {
    name: 'Back Escape',
    position: 'Escapes',
    description:
      'Defend the choking arm, control the hooks, and turn into them to remove back control before it is fully established.',
  },
  {
    name: 'Kesa Gatame (Side Control Pin)',
    position: 'Side Control',
    description:
      'A scarf-hold side pin — control the head and far arm with your body weight driven through the chest.',
  },
  {
    name: 'Knee-on-Belly',
    position: 'Side Control',
    description:
      'A mobile, pressure-heavy pin with a knee driven into the stomach — uncomfortable to hold, easy to transition from.',
  },
  {
    name: 'Double Leg Takedown',
    position: 'Standing',
    description:
      'Shoot in low, wrap both legs, and drive through to bring them to the mat.',
  },
  {
    name: 'Sprawl',
    position: 'Standing',
    description:
      'The core takedown defense — kick your legs back and drop your hips to stuff a shot and get on top.',
  },
  {
    name: 'Knee Cut Pass',
    position: 'Transitions',
    description:
      'A fundamental guard pass — cut your knee across their leg while controlling the far hip to slide into side control.',
  },
  {
    name: 'Technical Stand-Up',
    position: 'Transitions',
    description:
      'The safe way to return to your feet from the ground while keeping a hand and eyes on your opponent.',
  },
];
