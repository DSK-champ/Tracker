require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

const taskSchema = new mongoose.Schema({
  date: String, dayType: String, blockId: String, blockLabel: String,
  category: String, collection: String,
  subtasks: [{ id: String, label: String, done: Boolean, isDefault: Boolean, order: Number }],
  notes: String
}, { timestamps: true });

const sleepSchema = new mongoose.Schema({
  date: String, bedtime: String, wakeTime: String,
  durationMinutes: Number, quality: Number, notes: String
}, { timestamps: true });

const stressSchema = new mongoose.Schema({
  date: String, score: Number, triggers: [String], notes: String
}, { timestamps: true });

const reflectionSchema = new mongoose.Schema({
  date: String,
  answers: [{ question: String, type: { type: String }, answer: String }],
  productivityScore: Number, mood: Number
}, { timestamps: true });

const Task       = mongoose.model('Task', taskSchema);
const Sleep      = mongoose.model('Sleep', sleepSchema);
const Stress     = mongoose.model('Stress', stressSchema);
const Reflection = mongoose.model('Reflection', reflectionSchema);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function getDayType(dateStr) {
  const d = new Date(dateStr + 'T12:00:00').getDay();
  return d === 0 ? 'sunday' : [1, 3, 5].includes(d) ? 'A' : 'B';
}

const BLOCKS = {
  A: [
    { id:'wakeup',    label:'Wake up + hydrate',                     cat:'rest',  col:'general',       subs:['Drink 500ml water','Brush teeth','Quick freshen up'] },
    { id:'gym',       label:'Walk to gym + gym session',             cat:'body',  col:'gym',           subs:['Walk to gym (15 min)','Warm up (10 min)','Main lift session','Cool down / stretch'] },
    { id:'morning',   label:'Shower + morning skincare + breakfast', cat:'looks', col:'looksmax',      subs:['Shower','Cleanser','Toner','Moisturiser','SPF','Breakfast (high protein)'] },
    { id:'dsa',       label:'DSA deep work',                         cat:'tech',  col:'DSA',           subs:['Solve 2 problems','Review editorial','Note patterns'] },
    { id:'break1',    label:'Break',                                 cat:'rest',  col:'general',       subs:['Walk around','Hydrate','No doom-scroll'] },
    { id:'mern1',     label:'MERN stack',                            cat:'tech',  col:'MERN',          subs:['Build feature','Write API route','Test in Postman'] },
    { id:'lunch',     label:'Lunch + rest',                          cat:'rest',  col:'general',       subs:['Eat (high protein)','Short nap if needed'] },
    { id:'mern2',     label:'MERN stack cont.',                      cat:'tech',  col:'MERN',          subs:['Frontend component','Connect to backend','Push to GitHub'] },
    { id:'break2',    label:'Break + snack',                         cat:'rest',  col:'general',       subs:['Fruit / nuts','Stretch'] },
    { id:'walk',      label:'Evening walk',                          cat:'body',  col:'gym',           subs:['30 min brisk walk'] },
    { id:'cyber',     label:'Cybersecurity',                         cat:'tech',  col:'Cybersecurity', subs:['TryHackMe room','Notes','Read writeup'] },
    { id:'dinner',    label:'Dinner',                                cat:'rest',  col:'general',       subs:['Eat (high protein, light carbs)'] },
    { id:'review',    label:'Review + plan tomorrow',                cat:'rest',  col:'general',       subs:['What did you solve today?','What to push next session?'] },
    { id:'nightlook', label:'Night shower + skincare',               cat:'looks', col:'looksmax',      subs:['Long shower (20 min)','Cleanser','Toner','Retinol','Night cream','Facial exercises','Voice maxxing (10 min)'] },
    { id:'bible',     label:'Bible study',                           cat:'bible', col:'bible',         subs:['Read passage','Reflect / journal'] },
    { id:'sleep',     label:'Lights out',                            cat:'rest',  col:'general',       subs:['Phone down','Sleep'] }
  ],
  B: [
    { id:'wakeup',    label:'Wake up + hydrate',                     cat:'rest',  col:'general',       subs:['Drink 500ml water','Brush teeth','Quick freshen up'] },
    { id:'gym',       label:'Walk to gym + gym session',             cat:'body',  col:'gym',           subs:['Walk to gym (15 min)','Warm up (10 min)','Main lift session','Cool down / stretch'] },
    { id:'morning',   label:'Shower + morning skincare + breakfast', cat:'looks', col:'looksmax',      subs:['Shower','Cleanser','Toner','Moisturiser','SPF','Breakfast (high protein)'] },
    { id:'cf',        label:'Codeforces / competitive',              cat:'tech',  col:'Codeforces',    subs:['Solve Div2 A','Solve Div2 B','Upsolve C','Read editorial'] },
    { id:'break1',    label:'Break',                                 cat:'rest',  col:'general',       subs:['Walk around','Hydrate','No doom-scroll'] },
    { id:'cyber1',    label:'Cybersecurity',                         cat:'tech',  col:'Cybersecurity', subs:['TryHackMe room','Notes','Read writeup'] },
    { id:'lunch',     label:'Lunch + rest',                          cat:'rest',  col:'general',       subs:['Eat (high protein)','Short nap if needed'] },
    { id:'cyber2',    label:'Cybersecurity cont.',                   cat:'tech',  col:'Cybersecurity', subs:['CTF challenge','Document findings'] },
    { id:'break2',    label:'Break + snack',                         cat:'rest',  col:'general',       subs:['Fruit / nuts','Stretch'] },
    { id:'walk',      label:'Evening walk',                          cat:'body',  col:'gym',           subs:['30 min brisk walk'] },
    { id:'dsarev',    label:'DSA revision / weak topics',            cat:'tech',  col:'DSA',           subs:['Review weak topic','Redo 1 problem','Update notes'] },
    { id:'dinner',    label:'Dinner',                                cat:'rest',  col:'general',       subs:['Eat (high protein, light carbs)'] },
    { id:'review',    label:'Review + plan tomorrow',                cat:'rest',  col:'general',       subs:['What did you solve today?','What to push next session?'] },
    { id:'nightlook', label:'Night shower + skincare',               cat:'looks', col:'looksmax',      subs:['Long shower (20 min)','Cleanser','Toner','Retinol','Night cream','Facial exercises','Voice maxxing (10 min)'] },
    { id:'bible',     label:'Bible study',                           cat:'bible', col:'bible',         subs:['Read passage','Reflect / journal'] },
    { id:'sleep',     label:'Lights out',                            cat:'rest',  col:'general',       subs:['Phone down','Sleep'] }
  ],
  sunday: [
    { id:'wakeup',    label:'Slow wake + hydrate',                   cat:'rest',  col:'general',       subs:['Drink water','Freshen up'] },
    { id:'gym',       label:'Walk to gym + gym session',             cat:'body',  col:'gym',           subs:['Walk to gym','Warm up','Main lift','Cool down'] },
    { id:'morning',   label:'Shower + breakfast',                    cat:'looks', col:'looksmax',      subs:['Shower','Skincare','Breakfast'] },
    { id:'study',     label:'DSA / CF upsolve + editorial reading',  cat:'tech',  col:'DSA',           subs:['Upsolve 2 problems','Read 3 editorials','Update notes'] },
    { id:'lunch',     label:'Lunch',                                 cat:'rest',  col:'general',       subs:['Eat well'] },
    { id:'free',      label:'Free time',                             cat:'rest',  col:'general',       subs:['Go out / rest'] },
    { id:'dinner',    label:'Dinner',                                cat:'rest',  col:'general',       subs:['Eat'] },
    { id:'nightlook', label:'Night shower + full skincare',          cat:'looks', col:'looksmax',      subs:['Shower','Cleanser','Toner','Retinol','Night cream','Facial exercises','Voice maxxing'] },
    { id:'bible',     label:'Bible study',                           cat:'bible', col:'bible',         subs:['Read passage','Reflect'] },
    { id:'sleep',     label:'Lights out',                            cat:'rest',  col:'general',       subs:['Phone down','Sleep'] }
  ]
};

// Realistic varied data — good start, slight dip mid-week, recovery
const DAY_DATA = [
  { daysAgo:1,  rate:0.94, bed:'21:15', wake:'05:00', slpQ:5, stress:3, strigger:'',              mood:5 },
  { daysAgo:2,  rate:0.88, bed:'21:30', wake:'05:00', slpQ:4, stress:4, strigger:'DSA problem',   mood:4 },
  { daysAgo:3,  rate:0.76, bed:'22:00', wake:'05:05', slpQ:4, stress:4, strigger:'workload',      mood:4 },
  { daysAgo:4,  rate:0.82, bed:'21:45', wake:'05:00', slpQ:4, stress:5, strigger:'exams',         mood:4 },
  { daysAgo:5,  rate:0.65, bed:'22:45', wake:'05:15', slpQ:3, stress:6, strigger:'exams, sleep',  mood:3 },
  { daysAgo:6,  rate:0.71, bed:'22:20', wake:'05:10', slpQ:3, stress:5, strigger:'deadlines',     mood:3 },
  { daysAgo:7,  rate:0.90, bed:'21:20', wake:'05:00', slpQ:5, stress:3, strigger:'',              mood:5 },
  { daysAgo:8,  rate:0.85, bed:'21:30', wake:'05:00', slpQ:4, stress:4, strigger:'MERN bug',      mood:4 },
  { daysAgo:9,  rate:0.78, bed:'22:10', wake:'05:00', slpQ:4, stress:5, strigger:'workload',      mood:4 },
  { daysAgo:10, rate:0.60, bed:'23:15', wake:'05:20', slpQ:2, stress:8, strigger:'exam stress',   mood:2 },
  { daysAgo:11, rate:0.55, bed:'23:30', wake:'05:30', slpQ:2, stress:7, strigger:'exam, anxiety', mood:2 },
  { daysAgo:12, rate:0.72, bed:'22:00', wake:'05:00', slpQ:3, stress:5, strigger:'deadlines',     mood:3 },
  { daysAgo:13, rate:0.88, bed:'21:30', wake:'05:00', slpQ:4, stress:3, strigger:'',              mood:4 },
  { daysAgo:14, rate:0.92, bed:'21:10', wake:'05:00', slpQ:5, stress:2, strigger:'',              mood:5 },
];

const WINS = [
  'Solved a hard DP problem on Codeforces',
  'Finished the REST API for the MERN project',
  'Completed TryHackMe networking room',
  'Hit a new PR on bench press',
  'Deployed MERN app to Vercel successfully',
  'Solved 3 DSA problems without hints',
  'Got through a full Cybersecurity module',
  'Maintained the full routine without skipping anything',
  'Woke up exactly at 5am — felt great',
  'Finished reading a full chapter of Proverbs',
  'Clean diet all day, high protein every meal',
  'Evening walk + listened to a CS podcast',
  'Upsolve session — understood 2 editorial tricks',
  'Full skincare + voice maxxing — consistent streak',
];

const IMPROVEMENTS = [
  'Start DSA session earlier, brain is sharper at 8am',
  'Cut phone after dinner — no exceptions',
  'Sleep by 9:15 not 9:30',
  'Drink more water throughout the day',
  'Review notes before starting new problems',
  'No YouTube before bed',
  'Plan MERN tasks the night before',
  'Stretch properly after gym instead of rushing',
  'Read Bible before phone in the morning',
  'Log meals to track protein intake better',
];

const MCQ_ANSWERS = {
  focus:   ['Very focused — deep work all day','Mostly focused','Average — half in half out','Mostly focused','Average — half in half out','Mostly focused','Very focused — deep work all day','Mostly focused','Mostly focused','Average — half in half out','Average — half in half out','Mostly focused','Very focused — deep work all day','Very focused — deep work all day'],
  gym:     ['Yes, full session','Yes, full session','Yes, full session','Yes, cut it short','Yes, full session','Yes, full session','Yes, full session','Yes, full session','Yes, cut it short','Partial — just walk','Yes, full session','Yes, full session','Yes, full session','Yes, full session'],
  diet:    ['On point — high protein','On point — high protein','Mostly good','Mostly good','Average','Mostly good','On point — high protein','On point — high protein','Mostly good','Average','Average','Mostly good','On point — high protein','On point — high protein'],
  sleep:   ['Yes, on time','Yes, on time','Slightly late < 30 min','Slightly late < 30 min','Late 30-60 min','Late 30-60 min','Yes, on time','Yes, on time','Slightly late < 30 min','Very late > 1 hr','Very late > 1 hr','Late 30-60 min','Yes, on time','Yes, on time'],
  stress:  ['Low — feeling good','Moderate — manageable','Moderate — manageable','Moderate — manageable','High — overwhelmed','Moderate — manageable','Low — feeling good','Low — feeling good','Moderate — manageable','High — overwhelmed','High — overwhelmed','Moderate — manageable','Low — feeling good','Low — feeling good'],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Clear all existing data
  await Task.deleteMany({});
  await Sleep.deleteMany({});
  await Stress.deleteMany({});
  await Reflection.deleteMany({});
  console.log('Cleared existing data\n');

  const catMap = { tech:'academics', body:'health', looks:'health', rest:'general', bible:'general', contest:'academics' };

  for (let i = 0; i < DAY_DATA.length; i++) {
    const entry   = DAY_DATA[i];
    const date    = daysAgo(entry.daysAgo);
    const dayType = getDayType(date);
    const rate    = entry.rate;

    console.log(`Seeding ${date} (${dayType}, ${Math.round(rate*100)}% done)...`);

    const blocks = BLOCKS[dayType];

    // Tasks
    for (const block of blocks) {
      const subtasks = block.subs.map((label, idx) => ({
        id: `st${idx}`, label,
        done: Math.random() < rate,
        isDefault: true, order: idx
      }));
      await Task.create({ date, dayType, blockId: block.id, blockLabel: block.label, category: catMap[block.cat] || 'general', collection: block.col, subtasks });
    }

    // Sleep
    const [bh,bm] = entry.bed.split(':').map(Number);
    const [wh,wm] = entry.wake.split(':').map(Number);
    let mins = (wh*60+wm)-(bh*60+bm); if(mins<0) mins+=1440;
    await Sleep.create({ date, bedtime: entry.bed, wakeTime: entry.wake, durationMinutes: mins, quality: entry.slpQ, notes: '' });

    // Stress
    await Stress.create({ date, score: entry.stress, triggers: entry.strigger ? [entry.strigger] : [], notes: '' });

    // Reflection
    await Reflection.create({
      date,
      productivityScore: Math.round(rate * 100),
      mood: entry.mood,
      answers: [
        { question: 'How focused were you today?',       type: 'mcq',  answer: MCQ_ANSWERS.focus[i] },
        { question: 'Did you complete your gym session?',type: 'mcq',  answer: MCQ_ANSWERS.gym[i] },
        { question: 'How was your diet today?',          type: 'mcq',  answer: MCQ_ANSWERS.diet[i] },
        { question: 'Did you stick to sleep schedule?',  type: 'mcq',  answer: MCQ_ANSWERS.sleep[i] },
        { question: 'Stress level right now?',           type: 'mcq',  answer: MCQ_ANSWERS.stress[i] },
        { question: 'What was your biggest win today?',  type: 'text', answer: WINS[i % WINS.length] },
        { question: 'What will you do differently tomorrow?', type: 'text', answer: IMPROVEMENTS[i % IMPROVEMENTS.length] },
      ]
    });

    console.log(`  done`);
  }

  console.log(`\n14 days of data seeded successfully.`);
  console.log(`Open http://localhost:3000 and check the Stats tab.`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
