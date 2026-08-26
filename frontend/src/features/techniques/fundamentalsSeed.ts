// Starter curriculum for a beginner's empty Technique Journal — real,
// well-known white-belt fundamentals grouped by position. Descriptions are
// deliberately high-level (not step-by-step instruction) since the actual
// teaching comes from the linked video. Each videoUrl was pulled from a
// real search result (not guessed) and points at a beginner-oriented
// tutorial for that specific technique.
export interface FundamentalSeed {
  name: string;
  position: string;
  description: string;
  videoUrl: string;
}

export const FUNDAMENTALS_SEED: FundamentalSeed[] = [
  {
    name: 'Scissor Sweep',
    position: 'Guard',
    description:
      'Classic closed-guard sweep: break their posture, control a sleeve and collar, then scissor your legs to off-balance and roll them over.',
    videoUrl: 'https://www.youtube.com/watch?v=63LRiI9Qn2o',
  },
  {
    name: 'Hip Bump Sweep',
    position: 'Guard',
    description:
      'From closed guard, post up and bump your hips into theirs to knock them backward while you come up on top.',
    videoUrl: 'https://www.youtube.com/watch?v=Ju-2dHsNI6s',
  },
  {
    name: 'Armbar from Guard',
    position: 'Submissions',
    description:
      'From closed guard, swivel your hips to bring a leg over their head and extend their arm across your hips to hyperextend the elbow.',
    videoUrl: 'https://www.youtube.com/watch?v=XUrxSihViJI',
  },
  {
    name: 'Triangle Choke',
    position: 'Submissions',
    description:
      'Isolate one of their arms across your body, trap their head and the other arm between your legs, then lock the triangle to finish.',
    videoUrl: 'https://www.youtube.com/watch?v=UGp6VzbkReA',
  },
  {
    name: 'Kimura',
    position: 'Submissions',
    description:
      'A figure-four shoulder lock on a bent arm — usable from guard, side control, or mount to force a tap or create a sweep/pass opportunity.',
    videoUrl: 'https://www.youtube.com/watch?v=mVkKOPNGvjA',
  },
  {
    name: 'Cross Collar Choke',
    position: 'Submissions',
    description:
      'From mount or guard, cross-grip both collars deep behind the neck and squeeze the elbows in to cut off blood flow.',
    videoUrl: 'https://www.youtube.com/watch?v=4q_TMA7usDw',
  },
  {
    name: 'Americana',
    position: 'Submissions',
    description:
      'A shoulder lock applied from mount or side control by pinning the arm in a right-angle "keylock" position and rotating.',
    videoUrl: 'https://www.youtube.com/watch?v=_XjAAnIBlhA',
  },
  {
    name: 'Rear Naked Choke',
    position: 'Submissions',
    description:
      'The highest-percentage finish in the sport — from back control, sink an arm under the chin and lock your hands behind the head.',
    videoUrl: 'https://www.youtube.com/watch?v=KW2RvtWgBxU',
  },
  {
    name: 'Mount Escape (Upa / Bridge and Roll)',
    position: 'Escapes',
    description:
      'Trap an arm and leg on one side, bridge explosively, and roll them over into your guard.',
    videoUrl: 'https://www.youtube.com/watch?v=01Fe3N1vZMY',
  },
  {
    name: 'Hip Escape (Shrimping)',
    position: 'Escapes',
    description:
      'The foundational escape movement — shrimp your hips away to create space and rebuild guard from side control or mount.',
    videoUrl: 'https://www.youtube.com/watch?v=3hROB_XHTRo',
  },
  {
    name: 'Back Escape',
    position: 'Escapes',
    description:
      'Defend the choking arm, control the hooks, and turn into them to remove back control before it is fully established.',
    videoUrl: 'https://www.youtube.com/watch?v=uyIV0ez9bUo',
  },
  {
    name: 'Kesa Gatame (Side Control Pin)',
    position: 'Side Control',
    description:
      'A scarf-hold side pin — control the head and far arm with your body weight driven through the chest.',
    videoUrl: 'https://www.youtube.com/watch?v=IcG7yaMz8g0',
  },
  {
    name: 'Knee-on-Belly',
    position: 'Side Control',
    description:
      'A mobile, pressure-heavy pin with a knee driven into the stomach — uncomfortable to hold, easy to transition from.',
    videoUrl: 'https://www.youtube.com/watch?v=VOBpU-CkND0',
  },
  {
    name: 'Double Leg Takedown',
    position: 'Standing',
    description:
      'Shoot in low, wrap both legs, and drive through to bring them to the mat.',
    videoUrl: 'https://www.youtube.com/watch?v=wxNAEByjOoA',
  },
  {
    name: 'Sprawl',
    position: 'Standing',
    description:
      'The core takedown defense — kick your legs back and drop your hips to stuff a shot and get on top.',
    videoUrl: 'https://www.youtube.com/watch?v=RyQC_VLi2cg',
  },
  {
    name: 'Knee Cut Pass',
    position: 'Transitions',
    description:
      'A fundamental guard pass — cut your knee across their leg while controlling the far hip to slide into side control.',
    videoUrl: 'https://www.youtube.com/watch?v=qjLWCJ3qmzI',
  },
  {
    name: 'Technical Stand-Up',
    position: 'Transitions',
    description:
      'The safe way to return to your feet from the ground while keeping a hand and eyes on your opponent.',
    videoUrl: 'https://www.youtube.com/watch?v=YAFqZsIV9ns',
  },
];
