/**
 * seed-gym.js
 * -----------
 * Seeds all workout data directly into MongoDB via the GymExercise model.
 * Run: node seed-gym.js
 *
 * Date format stored: YYYY-MM-DD
 * strengthScore = (set1Weight * set1Reps) + (set2Weight * set2Reps)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_ATLAS_URI_HERE';

const gymExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: {
    type: String,
    required: true,
    enum: ['Chest', 'Back', 'Biceps', 'Triceps', 'Forearms', 'Legs', 'Shoulders', 'Abs']
  },
  workouts: [{
    date: { type: String, required: true },
    set1Weight: { type: Number, required: true },
    set1Reps: { type: Number, required: true },
    set2Weight: { type: Number, required: true },
    set2Reps: { type: Number, required: true },
    strengthScore: { type: Number, required: true }
  }]
}, { timestamps: true });

const GymExercise = mongoose.model('GymExercise', gymExerciseSchema);

// ── Helper: convert "DD/MM" → "DD-MM-YY" ─────────────────────────────────
function toISO(ddmm) {
  const [d, m] = ddmm.trim().split('/');
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-26`;
}

// ── Parse DD-MM-YY to a sortable value ────────────────────────────────────
function parseDDMMYY(s) {
  const [d, m, y] = s.split('-').map(Number);
  return new Date(2000 + y, m - 1, d);
}

// ── Strength score formula ─────────────────────────────────────────────────
function score(w1, r1, w2, r2) {
  return (w1 * r1) + (w2 * r2);
}

// ── All workout data (only first 2 sets kept) ──────────────────────────────
const DATA = [
  {
    name: 'Incline Chest Press',
    muscleGroup: 'Chest',
    workouts: [
      { date: '26/05', w1: 12.5, r1: 6,  w2: 10,   r2: 9  },
      { date: '01/06', w1: 12.5, r1: 6,  w2: 10,   r2: 9  },
      { date: '05/06', w1: 12.5, r1: 4,  w2: 10,   r2: 8  },
    ]
  },
  {
    name: 'Pec Deck',
    muscleGroup: 'Chest',
    workouts: [
      { date: '26/05', w1: 70, r1: 8,  w2: 70, r2: 8  },
      { date: '01/06', w1: 80, r1: 5,  w2: 70, r2: 8  },
      { date: '05/06', w1: 80, r1: 8,  w2: 70, r2: 8  },
    ]
  },
  {
    name: 'Dips',
    muscleGroup: 'Chest',
    workouts: [
      { date: '26/05', w1: 60, r1: 8,  w2: 60, r2: 8  },
      { date: '01/06', w1: 50, r1: 5,  w2: 55, r2: 5  },
      { date: '05/06', w1: 50, r1: 8,  w2: 55, r2: 7  },
    ]
  },
  {
    name: 'Shoulder Press',
    muscleGroup: 'Shoulders',
    workouts: [
      { date: '26/05', w1: 70, r1: 8,  w2: 60, r2: 8  },
      { date: '01/06', w1: 90, r1: 6,  w2: 80, r2: 6  },
      { date: '05/06', w1: 90, r1: 6,  w2: 80, r2: 7  },
    ]
  },
  {
    name: 'Lateral Raises',
    muscleGroup: 'Shoulders',
    workouts: [
      { date: '26/05', w1: 20, r1: 14, w2: 20, r2: 16 },
      { date: '01/06', w1: 4,  r1: 15, w2: 4,  r2: 15 },
      { date: '05/06', w1: 4,  r1: 10, w2: 3,  r2: 15 },
    ]
  },
  {
    name: 'Bicep Curl Machine',
    muscleGroup: 'Biceps',
    workouts: [
      { date: '26/05', w1: 30, r1: 8,  w2: 20, r2: 10 },
      { date: '01/06', w1: 30, r1: 8,  w2: 20, r2: 10 },
      { date: '05/06', w1: 30, r1: 8,  w2: 20, r2: 10 },
    ]
  },
  {
    name: 'Preacher Curl',
    muscleGroup: 'Biceps',
    workouts: [
      { date: '26/05', w1: 6,  r1: 8,  w2: 5,  r2: 10 },
      { date: '01/06', w1: 6,  r1: 8,  w2: 5,  r2: 10 },
      { date: '05/06', w1: 6,  r1: 7,  w2: 5,  r2: 12 },
    ]
  },
  {
    name: 'Hamstring Curl',
    muscleGroup: 'Legs',
    workouts: [
      { date: '27/05', w1: 60, r1: 8,  w2: 50, r2: 12 },
      { date: '02/06', w1: 70, r1: 7,  w2: 60, r2: 8  },
    ]
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Legs',
    workouts: [
      { date: '27/05', w1: 25, r1: 12, w2: 25, r2: 12 },
      { date: '02/06', w1: 35, r1: 10, w2: 30, r2: 12 },
    ]
  },
  {
    name: 'Calf Raises',
    muscleGroup: 'Legs',
    workouts: [
      { date: '27/05', w1: 30, r1: 10, w2: 35, r2: 15 },
      { date: '02/06', w1: 45, r1: 8,  w2: 40, r2: 10 },
    ]
  },
  {
    name: 'Wide Grip Lat Pulldown',
    muscleGroup: 'Back',
    workouts: [
      { date: '28/05', w1: 80, r1: 12, w2: 80, r2: 12 },
      { date: '04/06', w1: 90, r1: 7,  w2: 80, r2: 11 },
      { date: '06/06', w1: 80, r1: 6,  w2: 70, r2: 6  },
    ]
  },
  {
    name: 'Chest Supported T-Bar Row',
    muscleGroup: 'Back',
    workouts: [
      { date: '28/05', w1: 10,   r1: 8,  w2: 7.5,  r2: 12 },
      { date: '04/06', w1: 10,   r1: 8,  w2: 7.5,  r2: 12 },
      { date: '06/06', w1: 12.5, r1: 15, w2: 12.5, r2: 8  },
    ]
  },
  {
    name: 'Cable Row',
    muscleGroup: 'Back',
    workouts: [
      { date: '28/05', w1: 50, r1: 8, w2: 60, r2: 8 },
      { date: '04/06', w1: 50, r1: 8, w2: 60, r2: 8 },
      { date: '06/06', w1: 60, r1: 4, w2: 50, r2: 8 },
    ]
  },
  {
    name: 'Pull Ups',
    muscleGroup: 'Back',
    workouts: [
      // 28/05 and 04/06 are 0,0 — skip those (no useful data)
      { date: '06/06', w1: 50, r1: 8, w2: 0, r2: 0 },
    ]
  },
  {
    name: 'Rope Pushdown',
    muscleGroup: 'Triceps',
    workouts: [
      { date: '06/06', w1: 50, r1: 15, w2: 50, r2: 12 },
    ]
  },
  {
    name: 'Rod Overgrip Pushdown',
    muscleGroup: 'Triceps',
    workouts: [
      { date: '28/05', w1: 40, r1: 12, w2: 30, r2: 15 },
      { date: '04/06', w1: 40, r1: 12, w2: 30, r2: 15 },
      { date: '06/06', w1: 40, r1: 12, w2: 30, r2: 15 },
    ]
  },
];

// ── Main seed function ─────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  let created = 0, updated = 0, skipped = 0;

  for (const entry of DATA) {
    // Find existing doc or create new one
    let doc = await GymExercise.findOne({ name: entry.name });

    if (!doc) {
      doc = new GymExercise({ name: entry.name, muscleGroup: entry.muscleGroup, workouts: [] });
      console.log(`➕ Creating exercise: ${entry.name}`);
      created++;
    } else {
      console.log(`🔄 Updating exercise: ${entry.name}`);
      updated++;
    }

    for (const w of entry.workouts) {
      const isoDate = toISO(w.date);

      // Check if a workout for this date already exists → update it
      const existingIdx = doc.workouts.findIndex(x => x.date === isoDate);
      const strengthScore = score(w.w1, w.r1, w.w2, w.r2);

      if (existingIdx >= 0) {
        // Update in-place
        doc.workouts[existingIdx].set1Weight  = w.w1;
        doc.workouts[existingIdx].set1Reps    = w.r1;
        doc.workouts[existingIdx].set2Weight  = w.w2;
        doc.workouts[existingIdx].set2Reps    = w.r2;
        doc.workouts[existingIdx].strengthScore = strengthScore;
        console.log(`   ↪ Updated workout on ${isoDate} (score: ${strengthScore})`);
        skipped++;
      } else {
        doc.workouts.push({
          date: isoDate,
          set1Weight: w.w1,
          set1Reps:   w.r1,
          set2Weight: w.w2,
          set2Reps:   w.r2,
          strengthScore
        });
        console.log(`   ➕ Added workout on ${isoDate} (score: ${strengthScore})`);
      }
    }

    // Keep workouts sorted by date ascending (oldest first for graph)
    doc.workouts.sort((a, b) => parseDDMMYY(a.date) - parseDDMMYY(b.date));
    await doc.save();
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Done! Created: ${created} | Updated: ${updated} exercises`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await mongoose.disconnect();
}

seed().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
