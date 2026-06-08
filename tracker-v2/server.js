require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_ATLAS_URI_HERE';
mongoose.connect(MONGO_URI).then(() => console.log('MongoDB connected')).catch(e => console.error(e));

// ─── Schemas ──────────────────────────────────────────────────────────────────

const taskSchema = new mongoose.Schema({
  date: { type: String, required: true },       // "YYYY-MM-DD"
  dayType: { type: String },                    // "custom" or optional
  blockId: String,
  blockLabel: String,
  startTime: String,                            // "HH:MM"
  endTime: String,                              // "HH:MM"
  colorClass: String,                           // e.g. "tech", "body", "looks", "rest", "bible", "contest"
  category: { type: String },
  collection: String,                            // e.g. "DSA","MERN","gym","looksmax"
  subtasks: [{
    id: String,
    label: String,
    done: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: true },
    order: Number
  }],
  notes: String
}, { timestamps: true });

const sleepSchema = new mongoose.Schema({
  date: { type: String, required: true },
  bedtime: String,          // "22:30"
  wakeTime: String,         // "05:00"
  durationMinutes: Number,
  quality: { type: Number, min: 1, max: 5 },
  notes: String
}, { timestamps: true });

const stressSchema = new mongoose.Schema({
  date: { type: String, required: true },
  score: { type: Number, min: 0, max: 10 },
  triggers: [String],
  notes: String
}, { timestamps: true });

const reflectionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  answers: [{
    question: String,
    type: { type: String, enum: ['mcq','text'] },
    answer: String
  }],
  productivityScore: Number,   // calculated % of tasks done
  mood: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

const dayConfigSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  dayType: { type: String, enum: ['A','B','sunday'], required: true },
  contest: { type: Boolean, default: false }
}, { timestamps: true });

const gymExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true, enum: ['Chest','Back','Biceps','Triceps','Forearms','Legs','Shoulders','Abs'] },
  workouts: [{
    date: { type: String, required: true },
    set1Weight: { type: Number, required: true },
    set1Reps: { type: Number, required: true },
    set2Weight: { type: Number, required: true },
    set2Reps: { type: Number, required: true },
    strengthScore: { type: Number, required: true }
  }]
}, { timestamps: true });

const Task        = mongoose.model('Task', taskSchema);
const Sleep       = mongoose.model('Sleep', sleepSchema);
const Stress      = mongoose.model('Stress', stressSchema);
const Reflection  = mongoose.model('Reflection', reflectionSchema);
const DayConfig   = mongoose.model('DayConfig', dayConfigSchema);
const GymExercise = mongoose.model('GymExercise', gymExerciseSchema);

// ─── Task Routes ─────────────────────────────────────────────────────────────

// Get or create day's tasks
app.get('/api/tasks/:date', async (req, res) => {
  try {
    const tasks = await Task.find({ date: req.params.date });
    res.json(tasks);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const existing = await Task.findOne({ date: req.body.date, blockId: req.body.blockId });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.json(existing);
    }
    const task = await Task.create(req.body);
    res.json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Sleep Routes ────────────────────────────────────────────────────────────

app.get('/api/sleep', async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from && to) query.date = { $gte: from, $lte: to };
    const records = await Sleep.find(query).sort({ date: -1 }).limit(30);
    res.json(records);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sleep', async (req, res) => {
  try {
    const existing = await Sleep.findOne({ date: req.body.date });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.json(existing);
    }
    const record = await Sleep.create(req.body);
    res.json(record);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Stress Routes ───────────────────────────────────────────────────────────

app.get('/api/stress', async (req, res) => {
  try {
    const records = await Stress.find().sort({ date: -1 }).limit(30);
    res.json(records);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/stress', async (req, res) => {
  try {
    const existing = await Stress.findOne({ date: req.body.date });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.json(existing);
    }
    const record = await Stress.create(req.body);
    res.json(record);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Reflection Routes ───────────────────────────────────────────────────────

app.get('/api/reflection/:date', async (req, res) => {
  try {
    const record = await Reflection.findOne({ date: req.params.date });
    res.json(record);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reflection', async (req, res) => {
  try {
    const existing = await Reflection.findOne({ date: req.body.date });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.json(existing);
    }
    const record = await Reflection.create(req.body);
    res.json(record);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── DayConfig Routes ────────────────────────────────────────────────────────

app.get('/api/dayconfig/:date', async (req, res) => {
  try {
    const record = await DayConfig.findOne({ date: req.params.date });
    res.json(record || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/dayconfig', async (req, res) => {
  try {
    const existing = await DayConfig.findOne({ date: req.body.date });
    if (existing) {
      existing.dayType = req.body.dayType;
      existing.contest = req.body.contest;
      await existing.save();
      return res.json(existing);
    }
    const record = await DayConfig.create(req.body);
    res.json(record);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Stats Routes ────────────────────────────────────────────────────────────

app.get('/api/stats/productivity', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ date: -1 }).limit(200);
    const byDate = {};
    tasks.forEach(t => {
      if (!byDate[t.date]) byDate[t.date] = { total: 0, done: 0 };
      t.subtasks.forEach(s => {
        byDate[t.date].total++;
        if (s.done) byDate[t.date].done++;
      });
    });
    const result = Object.entries(byDate).map(([date, v]) => ({
      date,
      pct: v.total ? Math.round((v.done / v.total) * 100) : 0,
      done: v.done,
      total: v.total
    })).sort((a,b) => a.date.localeCompare(b.date));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stats/sleep', async (req, res) => {
  try {
    const records = await Sleep.find().sort({ date: -1 }).limit(30);
    res.json(records.reverse());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stats/stress', async (req, res) => {
  try {
    const records = await Stress.find().sort({ date: -1 }).limit(30);
    res.json(records.reverse());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stats/streaks', async (req, res) => {
  try {
    const gymTasks = await Task.find({ collection: 'gym' }).sort({ date: -1 }).limit(60);
    const dates = [...new Set(gymTasks.map(t => t.date))].sort();
    let streak = 0, maxStreak = 0, cur = 0;
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) { cur = 1; continue; }
      const prev = new Date(dates[i-1]), curr = new Date(dates[i]);
      const diff = (curr - prev) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
      maxStreak = Math.max(maxStreak, cur);
    }
    const _n = new Date(); const today = _n.getFullYear()+'-'+String(_n.getMonth()+1).padStart(2,'0')+'-'+String(_n.getDate()).padStart(2,'0');
    const lastDate = dates[dates.length - 1];
    const daysSinceLast = lastDate ? Math.floor((new Date(today) - new Date(lastDate)) / 86400000) : 999;
    streak = daysSinceLast <= 1 ? cur : 0;
    res.json({ currentStreak: streak, maxStreak, totalDays: dates.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stats/academic', async (req, res) => {
  try {
    const collections = ['DSA','MERN','Cybersecurity','Codeforces'];
    const result = {};
    for (const col of collections) {
      const tasks = await Task.find({ collection: col });
      let total = 0, done = 0;
      tasks.forEach(t => { t.subtasks.forEach(s => { total++; if(s.done) done++; }); });
      result[col] = { total, done, pct: total ? Math.round((done/total)*100) : 0 };
    }
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Gym Routes ──────────────────────────────────────────────────────────────

// Parse DD-MM-YY to Date for proper chronological sorting
function parseDDMMYY(s) {
  const [d, m, y] = s.split('-').map(Number);
  return new Date(2000 + y, m - 1, d);
}

app.get('/api/gym/exercises', async (req, res) => {
  try {
    const exercises = await GymExercise.find().sort({ muscleGroup: 1, name: 1 });
    res.json(exercises);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gym/exercises', async (req, res) => {
  try {
    const exercise = await GymExercise.create({ name: req.body.name, muscleGroup: req.body.muscleGroup, workouts: [] });
    res.json(exercise);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/gym/exercises/:id', async (req, res) => {
  try {
    await GymExercise.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gym/exercises/:id/workouts', async (req, res) => {
  try {
    const ex = await GymExercise.findById(req.params.id);
    if (!ex) return res.status(404).json({ error: 'Exercise not found' });
    const { date, set1Weight, set1Reps, set2Weight, set2Reps } = req.body;
    const strengthScore = (set1Weight * set1Reps) + (set2Weight * set2Reps);
    // Check for existing entry on same date — update if exists
    const existingIdx = ex.workouts.findIndex(w => w.date === date);
    if (existingIdx >= 0) {
      ex.workouts[existingIdx] = { ...ex.workouts[existingIdx].toObject(), set1Weight, set1Reps, set2Weight, set2Reps, strengthScore };
    } else {
      ex.workouts.push({ date, set1Weight, set1Reps, set2Weight, set2Reps, strengthScore });
    }
    // Sort ascending (oldest → newest) for graph; log table reverses in frontend
    ex.workouts.sort((a, b) => parseDDMMYY(a.date) - parseDDMMYY(b.date));
    await ex.save();
    res.json(ex);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/gym/exercises/:id/workouts/:wid', async (req, res) => {
  try {
    const ex = await GymExercise.findById(req.params.id);
    if (!ex) return res.status(404).json({ error: 'Exercise not found' });
    ex.workouts = ex.workouts.filter(w => w._id.toString() !== req.params.wid);
    await ex.save();
    res.json(ex);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/gym/exercises/:id/workouts/:wid', async (req, res) => {
  try {
    const ex = await GymExercise.findById(req.params.id);
    if (!ex) return res.status(404).json({ error: 'Exercise not found' });
    const wIdx = ex.workouts.findIndex(w => w._id.toString() === req.params.wid);
    if (wIdx < 0) return res.status(404).json({ error: 'Workout not found' });
    const { date, set1Weight, set1Reps, set2Weight, set2Reps } = req.body;
    const strengthScore = (set1Weight * set1Reps) + (set2Weight * set2Reps);
    ex.workouts[wIdx].date        = date;
    ex.workouts[wIdx].set1Weight  = set1Weight;
    ex.workouts[wIdx].set1Reps    = set1Reps;
    ex.workouts[wIdx].set2Weight  = set2Weight;
    ex.workouts[wIdx].set2Reps    = set2Reps;
    ex.workouts[wIdx].strengthScore = strengthScore;
    ex.workouts.sort((a, b) => parseDDMMYY(a.date) - parseDDMMYY(b.date));
    await ex.save();
    res.json(ex);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Serve frontend ──────────────────────────────────────────────────────────
app.get('/{*splat}', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
