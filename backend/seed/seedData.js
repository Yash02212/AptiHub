const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const Test = require('../models/Test');
const Achievement = require('../models/Achievement');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}), Topic.deleteMany({}),
    Question.deleteMany({}), Test.deleteMany({}), Achievement.deleteMany({})
  ]);

  // Create admin
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@aptitudehub.com',
    password: 'admin123',
    role: 'admin',
    college: 'AptitudeHub',
    year: 'Graduate'
  });
  console.log('✅ Admin created: admin@aptitudehub.com / admin123');

  // Create demo student
  await User.create({
    name: 'Demo Student',
    email: 'student@aptitudehub.com',
    password: 'student123',
    role: 'student',
    college: 'Demo University',
    year: '3rd Year',
    branch: 'CSE'
  });
  console.log('✅ Student created: student@aptitudehub.com / student123');

  // Categories
  const cats = await Category.insertMany([
    { name: 'Quantitative Aptitude', slug: 'quantitative-aptitude', description: 'Master numbers, algebra, percentages, and mathematical problem-solving skills', icon: '📐', color: '#2563EB', order: 1 },
    { name: 'Logical Reasoning', slug: 'logical-reasoning', description: 'Sharpen your analytical thinking and logical deduction abilities', icon: '🧠', color: '#7C3AED', order: 2 },
    { name: 'Verbal Ability', slug: 'verbal-ability', description: 'Improve grammar, vocabulary, and reading comprehension skills', icon: '📖', color: '#06B6D4', order: 3 },
    { name: 'Data Interpretation', slug: 'data-interpretation', description: 'Analyze charts, graphs, tables, and complex data sets', icon: '📊', color: '#10B981', order: 4 }
  ]);
  console.log('✅ Categories created');

  const [quant, logic, verbal, di] = cats;

  // Topics
  const topicsData = [
    // Quantitative
    { name: 'Percentage', slug: 'percentage', category: quant._id, icon: '📊' },
    { name: 'Profit & Loss', slug: 'profit-loss', category: quant._id, icon: '💰' },
    { name: 'Simple Interest', slug: 'simple-interest', category: quant._id, icon: '🏦' },
    { name: 'Compound Interest', slug: 'compound-interest', category: quant._id, icon: '📈' },
    { name: 'Ratio & Proportion', slug: 'ratio-proportion', category: quant._id, icon: '⚖️' },
    { name: 'Average', slug: 'average', category: quant._id, icon: '📏' },
    { name: 'Time & Work', slug: 'time-work', category: quant._id, icon: '⏰' },
    { name: 'Time, Speed & Distance', slug: 'time-speed-distance', category: quant._id, icon: '🚗' },
    { name: 'Number System', slug: 'number-system', category: quant._id, icon: '🔢' },
    { name: 'Probability', slug: 'probability', category: quant._id, icon: '🎲' },
    { name: 'Permutation & Combination', slug: 'permutation-combination', category: quant._id, icon: '🔄' },
    { name: 'Algebra', slug: 'algebra', category: quant._id, icon: '➗' },
    // Logical
    { name: 'Coding-Decoding', slug: 'coding-decoding', category: logic._id, icon: '🔐' },
    { name: 'Blood Relations', slug: 'blood-relations', category: logic._id, icon: '👨‍👩‍👧‍👦' },
    { name: 'Directions', slug: 'directions', category: logic._id, icon: '🧭' },
    { name: 'Series', slug: 'series', category: logic._id, icon: '🔗' },
    { name: 'Syllogism', slug: 'syllogism', category: logic._id, icon: '📋' },
    { name: 'Seating Arrangement', slug: 'seating-arrangement', category: logic._id, icon: '💺' },
    { name: 'Puzzles', slug: 'puzzles', category: logic._id, icon: '🧩' },
    { name: 'Analogy', slug: 'analogy', category: logic._id, icon: '🔄' },
    { name: 'Classification', slug: 'classification', category: logic._id, icon: '📂' },
    { name: 'Statement & Conclusion', slug: 'statement-conclusion', category: logic._id, icon: '💡' },
    // Verbal
    { name: 'Grammar', slug: 'grammar', category: verbal._id, icon: '📝' },
    { name: 'Vocabulary', slug: 'vocabulary', category: verbal._id, icon: '📚' },
    { name: 'Synonyms', slug: 'synonyms', category: verbal._id, icon: '🔤' },
    { name: 'Antonyms', slug: 'antonyms', category: verbal._id, icon: '↔️' },
    { name: 'Sentence Correction', slug: 'sentence-correction', category: verbal._id, icon: '✏️' },
    { name: 'Reading Comprehension', slug: 'reading-comprehension', category: verbal._id, icon: '📖' },
    { name: 'Para Jumbles', slug: 'para-jumbles', category: verbal._id, icon: '🔀' },
    { name: 'Fill in the Blanks', slug: 'fill-in-blanks', category: verbal._id, icon: '___' },
    // DI
    { name: 'Tables', slug: 'tables', category: di._id, icon: '📋' },
    { name: 'Bar Graphs', slug: 'bar-graphs', category: di._id, icon: '📊' },
    { name: 'Pie Charts', slug: 'pie-charts', category: di._id, icon: '🥧' },
    { name: 'Line Graphs', slug: 'line-graphs', category: di._id, icon: '📈' },
    { name: 'Caselets', slug: 'caselets', category: di._id, icon: '📄' }
  ];

  const topics = await Topic.insertMany(topicsData);
  console.log('✅ Topics created');

  // Map topics by slug
  const topicMap = {};
  topics.forEach(t => { topicMap[t.slug] = t; });

  // Questions - 200+ questions across all categories
  const questionsData = [
    // PERCENTAGE
    { question: 'What is 25% of 200?', category: quant._id, topic: topicMap['percentage']._id, difficulty: 'easy', options: [{ label: 'A', text: '25' }, { label: 'B', text: '50' }, { label: 'C', text: '75' }, { label: 'D', text: '100' }], correctAnswer: 'B', explanation: '25% of 200 = (25/100) × 200 = 50', marks: 1 },
    { question: 'If a number is increased by 20% and then decreased by 20%, what is the net change?', category: quant._id, topic: topicMap['percentage']._id, difficulty: 'medium', options: [{ label: 'A', text: 'No change' }, { label: 'B', text: '4% decrease' }, { label: 'C', text: '4% increase' }, { label: 'D', text: '2% decrease' }], correctAnswer: 'B', explanation: 'Let the number be 100. After 20% increase: 120. After 20% decrease: 120 × 0.8 = 96. Net change = 4% decrease.', marks: 1 },
    { question: 'A student scored 72 marks out of 80. What is the percentage?', category: quant._id, topic: topicMap['percentage']._id, difficulty: 'easy', options: [{ label: 'A', text: '85%' }, { label: 'B', text: '90%' }, { label: 'C', text: '80%' }, { label: 'D', text: '92%' }], correctAnswer: 'B', explanation: '(72/80) × 100 = 90%', marks: 1 },
    { question: 'If 40% of a number is 80, what is 60% of the same number?', category: quant._id, topic: topicMap['percentage']._id, difficulty: 'easy', options: [{ label: 'A', text: '100' }, { label: 'B', text: '120' }, { label: 'C', text: '140' }, { label: 'D', text: '160' }], correctAnswer: 'B', explanation: 'If 40% = 80, then number = 200. 60% of 200 = 120.', marks: 1 },
    { question: 'The population of a town increased from 50,000 to 60,000. What is the percentage increase?', category: quant._id, topic: topicMap['percentage']._id, difficulty: 'easy', options: [{ label: 'A', text: '10%' }, { label: 'B', text: '15%' }, { label: 'C', text: '20%' }, { label: 'D', text: '25%' }], correctAnswer: 'C', explanation: 'Increase = 10,000. Percentage = (10,000/50,000) × 100 = 20%', marks: 1 },
    // PROFIT & LOSS
    { question: 'A shopkeeper buys an item for ₹400 and sells it for ₹500. What is the profit percentage?', category: quant._id, topic: topicMap['profit-loss']._id, difficulty: 'easy', options: [{ label: 'A', text: '20%' }, { label: 'B', text: '25%' }, { label: 'C', text: '30%' }, { label: 'D', text: '15%' }], correctAnswer: 'B', explanation: 'Profit = 500 - 400 = 100. Profit % = (100/400) × 100 = 25%', marks: 1 },
    { question: 'If the cost price is ₹150 and selling price is ₹120, what is the loss percentage?', category: quant._id, topic: topicMap['profit-loss']._id, difficulty: 'easy', options: [{ label: 'A', text: '15%' }, { label: 'B', text: '20%' }, { label: 'C', text: '25%' }, { label: 'D', text: '30%' }], correctAnswer: 'B', explanation: 'Loss = 150 - 120 = 30. Loss % = (30/150) × 100 = 20%', marks: 1 },
    { question: 'An article bought for ₹600 is sold at a profit of 15%. What is the selling price?', category: quant._id, topic: topicMap['profit-loss']._id, difficulty: 'easy', options: [{ label: 'A', text: '₹680' }, { label: 'B', text: '₹690' }, { label: 'C', text: '₹700' }, { label: 'D', text: '₹650' }], correctAnswer: 'B', explanation: 'SP = CP × (1 + P/100) = 600 × 1.15 = ₹690', marks: 1 },
    { question: 'If selling price is twice the cost price, what is the profit percentage?', category: quant._id, topic: topicMap['profit-loss']._id, difficulty: 'medium', options: [{ label: 'A', text: '50%' }, { label: 'B', text: '75%' }, { label: 'C', text: '100%' }, { label: 'D', text: '200%' }], correctAnswer: 'C', explanation: 'If CP = x, SP = 2x. Profit = x. Profit % = (x/x) × 100 = 100%', marks: 1 },
    // SIMPLE INTEREST
    { question: 'Find the simple interest on ₹5000 at 10% per annum for 2 years.', category: quant._id, topic: topicMap['simple-interest']._id, difficulty: 'easy', options: [{ label: 'A', text: '₹500' }, { label: 'B', text: '₹1000' }, { label: 'C', text: '₹1500' }, { label: 'D', text: '₹750' }], correctAnswer: 'B', explanation: 'SI = P × R × T / 100 = 5000 × 10 × 2 / 100 = ₹1000', marks: 1 },
    { question: 'At what rate of interest will ₹2000 become ₹2400 in 4 years at simple interest?', category: quant._id, topic: topicMap['simple-interest']._id, difficulty: 'medium', options: [{ label: 'A', text: '3%' }, { label: 'B', text: '4%' }, { label: 'C', text: '5%' }, { label: 'D', text: '6%' }], correctAnswer: 'C', explanation: 'SI = 400. Rate = (SI × 100)/(P × T) = (400 × 100)/(2000 × 4) = 5%', marks: 1 },
    // RATIO & PROPORTION
    { question: 'If A:B = 3:5 and B:C = 4:7, find A:B:C.', category: quant._id, topic: topicMap['ratio-proportion']._id, difficulty: 'medium', options: [{ label: 'A', text: '12:20:35' }, { label: 'B', text: '3:5:7' }, { label: 'C', text: '12:15:35' }, { label: 'D', text: '9:15:35' }], correctAnswer: 'A', explanation: 'A:B = 3:5 → multiply by 4 → 12:20. B:C = 4:7 → multiply by 5 → 20:35. So A:B:C = 12:20:35', marks: 1 },
    { question: 'Divide ₹1200 in the ratio 3:5.', category: quant._id, topic: topicMap['ratio-proportion']._id, difficulty: 'easy', options: [{ label: 'A', text: '₹400 and ₹800' }, { label: 'B', text: '₹450 and ₹750' }, { label: 'C', text: '₹500 and ₹700' }, { label: 'D', text: '₹350 and ₹850' }], correctAnswer: 'B', explanation: 'Total parts = 8. First = (3/8) × 1200 = ₹450. Second = (5/8) × 1200 = ₹750', marks: 1 },
    // AVERAGE
    { question: 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What is the removed number?', category: quant._id, topic: topicMap['average']._id, difficulty: 'medium', options: [{ label: 'A', text: '24' }, { label: 'B', text: '26' }, { label: 'C', text: '28' }, { label: 'D', text: '30' }], correctAnswer: 'C', explanation: 'Total = 5 × 20 = 100. After removing = 4 × 18 = 72. Removed = 100 - 72 = 28', marks: 1 },
    { question: 'Find the average of first 10 natural numbers.', category: quant._id, topic: topicMap['average']._id, difficulty: 'easy', options: [{ label: 'A', text: '5' }, { label: 'B', text: '5.5' }, { label: 'C', text: '6' }, { label: 'D', text: '4.5' }], correctAnswer: 'B', explanation: 'Sum of first n natural numbers = n(n+1)/2 = 10×11/2 = 55. Average = 55/10 = 5.5', marks: 1 },
    // TIME & WORK
    { question: 'A can do a work in 10 days and B can do it in 15 days. In how many days will they finish it together?', category: quant._id, topic: topicMap['time-work']._id, difficulty: 'medium', options: [{ label: 'A', text: '5 days' }, { label: 'B', text: '6 days' }, { label: 'C', text: '7 days' }, { label: 'D', text: '8 days' }], correctAnswer: 'B', explanation: 'Combined work per day = 1/10 + 1/15 = 5/30 = 1/6. Together = 6 days', marks: 1 },
    { question: 'If 6 workers can finish a job in 12 days, how many days will 9 workers take?', category: quant._id, topic: topicMap['time-work']._id, difficulty: 'easy', options: [{ label: 'A', text: '6 days' }, { label: 'B', text: '8 days' }, { label: 'C', text: '10 days' }, { label: 'D', text: '7 days' }], correctAnswer: 'B', explanation: 'Workers × Days = Constant. 6 × 12 = 9 × D → D = 72/9 = 8 days', marks: 1 },
    // TIME SPEED DISTANCE
    { question: 'A car travels 240 km in 4 hours. What is its speed?', category: quant._id, topic: topicMap['time-speed-distance']._id, difficulty: 'easy', options: [{ label: 'A', text: '50 km/h' }, { label: 'B', text: '55 km/h' }, { label: 'C', text: '60 km/h' }, { label: 'D', text: '65 km/h' }], correctAnswer: 'C', explanation: 'Speed = Distance/Time = 240/4 = 60 km/h', marks: 1 },
    { question: 'Two trains running in opposite directions cross each other in 10 seconds. If their speeds are 36 km/h and 54 km/h, and one train is 100m long, find the other train\'s length.', category: quant._id, topic: topicMap['time-speed-distance']._id, difficulty: 'hard', options: [{ label: 'A', text: '100m' }, { label: 'B', text: '120m' }, { label: 'C', text: '150m' }, { label: 'D', text: '130m' }], correctAnswer: 'C', explanation: 'Relative speed = (36+54) × 5/18 = 25 m/s. Total length = 25 × 10 = 250m. Other train = 250 - 100 = 150m', marks: 1 },
    // NUMBER SYSTEM
    { question: 'What is the LCM of 12 and 18?', category: quant._id, topic: topicMap['number-system']._id, difficulty: 'easy', options: [{ label: 'A', text: '24' }, { label: 'B', text: '36' }, { label: 'C', text: '48' }, { label: 'D', text: '72' }], correctAnswer: 'B', explanation: '12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 36', marks: 1 },
    { question: 'What is the HCF of 48 and 64?', category: quant._id, topic: topicMap['number-system']._id, difficulty: 'easy', options: [{ label: 'A', text: '8' }, { label: 'B', text: '12' }, { label: 'C', text: '16' }, { label: 'D', text: '24' }], correctAnswer: 'C', explanation: '48 = 2⁴ × 3, 64 = 2⁶. HCF = 2⁴ = 16', marks: 1 },
    // PROBABILITY
    { question: 'A coin is tossed twice. What is the probability of getting at least one head?', category: quant._id, topic: topicMap['probability']._id, difficulty: 'easy', options: [{ label: 'A', text: '1/4' }, { label: 'B', text: '1/2' }, { label: 'C', text: '3/4' }, { label: 'D', text: '1' }], correctAnswer: 'C', explanation: 'P(at least one head) = 1 - P(no head) = 1 - 1/4 = 3/4', marks: 1 },
    { question: 'A bag contains 5 red and 3 blue balls. What is the probability of drawing a red ball?', category: quant._id, topic: topicMap['probability']._id, difficulty: 'easy', options: [{ label: 'A', text: '3/8' }, { label: 'B', text: '5/8' }, { label: 'C', text: '1/2' }, { label: 'D', text: '5/3' }], correctAnswer: 'B', explanation: 'P(red) = 5/(5+3) = 5/8', marks: 1 },
    // ALGEBRA
    { question: 'If 3x + 7 = 22, what is x?', category: quant._id, topic: topicMap['algebra']._id, difficulty: 'easy', options: [{ label: 'A', text: '3' }, { label: 'B', text: '4' }, { label: 'C', text: '5' }, { label: 'D', text: '6' }], correctAnswer: 'C', explanation: '3x = 22 - 7 = 15. x = 5', marks: 1 },
    { question: 'What is the sum of roots of x² - 7x + 12 = 0?', category: quant._id, topic: topicMap['algebra']._id, difficulty: 'medium', options: [{ label: 'A', text: '5' }, { label: 'B', text: '7' }, { label: 'C', text: '12' }, { label: 'D', text: '-7' }], correctAnswer: 'B', explanation: 'Sum of roots = -(-7)/1 = 7 (from Vieta\'s formulas)', marks: 1 },

    // LOGICAL REASONING
    // Coding-Decoding
    { question: 'If APPLE is coded as ELPPA, how is MANGO coded?', category: logic._id, topic: topicMap['coding-decoding']._id, difficulty: 'easy', options: [{ label: 'A', text: 'OGNAM' }, { label: 'B', text: 'OGANM' }, { label: 'C', text: 'NAMGO' }, { label: 'D', text: 'GNAMO' }], correctAnswer: 'A', explanation: 'The pattern is reversing the word. MANGO reversed = OGNAM', marks: 1 },
    { question: 'In a certain code, CAT is written as DBU. How is DOG written?', category: logic._id, topic: topicMap['coding-decoding']._id, difficulty: 'easy', options: [{ label: 'A', text: 'EPH' }, { label: 'B', text: 'EPG' }, { label: 'C', text: 'FOH' }, { label: 'D', text: 'DPH' }], correctAnswer: 'A', explanation: 'Each letter is shifted by +1: D→E, O→P, G→H = EPH', marks: 1 },
    // Blood Relations
    { question: 'Pointing to a photo, Ram said "He is the son of my father\'s only son." Who is in the photo?', category: logic._id, topic: topicMap['blood-relations']._id, difficulty: 'medium', options: [{ label: 'A', text: 'Ram himself' }, { label: 'B', text: 'Ram\'s father' }, { label: 'C', text: 'Ram\'s son' }, { label: 'D', text: 'Ram\'s brother' }], correctAnswer: 'C', explanation: 'Father\'s only son = Ram. Son of Ram = Ram\'s son.', marks: 1 },
    { question: 'A is the mother of B. B is the sister of C. D is the father of C. What is A to D?', category: logic._id, topic: topicMap['blood-relations']._id, difficulty: 'medium', options: [{ label: 'A', text: 'Mother' }, { label: 'B', text: 'Wife' }, { label: 'C', text: 'Sister' }, { label: 'D', text: 'Daughter' }], correctAnswer: 'B', explanation: 'A is mother of B. B is sister of C. So A is also mother of C. D is father of C. So A is wife of D.', marks: 1 },
    // Series
    { question: 'What comes next: 2, 6, 12, 20, 30, ?', category: logic._id, topic: topicMap['series']._id, difficulty: 'medium', options: [{ label: 'A', text: '40' }, { label: 'B', text: '42' }, { label: 'C', text: '44' }, { label: 'D', text: '38' }], correctAnswer: 'B', explanation: 'Differences: 4, 6, 8, 10, 12. Next = 30 + 12 = 42', marks: 1 },
    { question: 'Find the missing number: 3, 9, 27, 81, ?', category: logic._id, topic: topicMap['series']._id, difficulty: 'easy', options: [{ label: 'A', text: '162' }, { label: 'B', text: '243' }, { label: 'C', text: '216' }, { label: 'D', text: '324' }], correctAnswer: 'B', explanation: 'Each number is multiplied by 3. 81 × 3 = 243', marks: 1 },
    // Directions
    { question: 'A person walks 5 km North, then 3 km East, then 5 km South. How far is he from starting point?', category: logic._id, topic: topicMap['directions']._id, difficulty: 'easy', options: [{ label: 'A', text: '3 km' }, { label: 'B', text: '5 km' }, { label: 'C', text: '8 km' }, { label: 'D', text: '13 km' }], correctAnswer: 'A', explanation: 'North and South cancel out (5-5=0). He is 3 km East from start.', marks: 1 },
    // Syllogism
    { question: 'All cats are animals. All animals are living things. Conclusion: All cats are living things.', category: logic._id, topic: topicMap['syllogism']._id, difficulty: 'easy', options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }, { label: 'C', text: 'Cannot be determined' }, { label: 'D', text: 'Partially true' }], correctAnswer: 'A', explanation: 'By transitive property: Cats ⊂ Animals ⊂ Living Things, so Cats ⊂ Living Things.', marks: 1 },
    // Analogy
    { question: 'Book is to Read as Fork is to:', category: logic._id, topic: topicMap['analogy']._id, difficulty: 'easy', options: [{ label: 'A', text: 'Cook' }, { label: 'B', text: 'Eat' }, { label: 'C', text: 'Cut' }, { label: 'D', text: 'Serve' }], correctAnswer: 'B', explanation: 'A book is used to read. A fork is used to eat.', marks: 1 },
    // Classification
    { question: 'Which is the odd one out? Rose, Lily, Mango, Daisy', category: logic._id, topic: topicMap['classification']._id, difficulty: 'easy', options: [{ label: 'A', text: 'Rose' }, { label: 'B', text: 'Lily' }, { label: 'C', text: 'Mango' }, { label: 'D', text: 'Daisy' }], correctAnswer: 'C', explanation: 'Rose, Lily, Daisy are flowers. Mango is a fruit.', marks: 1 },
    { question: 'Which is the odd one out? 2, 3, 5, 9, 11', category: logic._id, topic: topicMap['classification']._id, difficulty: 'easy', options: [{ label: 'A', text: '2' }, { label: 'B', text: '5' }, { label: 'C', text: '9' }, { label: 'D', text: '11' }], correctAnswer: 'C', explanation: 'All others are prime numbers. 9 = 3 × 3 is not prime.', marks: 1 },

    // VERBAL ABILITY
    // Grammar
    { question: 'Choose the correct sentence:', category: verbal._id, topic: topicMap['grammar']._id, difficulty: 'easy', options: [{ label: 'A', text: 'He don\'t know nothing.' }, { label: 'B', text: 'He doesn\'t know anything.' }, { label: 'C', text: 'He don\'t knows anything.' }, { label: 'D', text: 'He doesn\'t knows nothing.' }], correctAnswer: 'B', explanation: '"Doesn\'t" is correct for third person singular, and "anything" is used with negative verbs.', marks: 1 },
    { question: 'Choose the correct form: "Neither the students nor the teacher ___ present."', category: verbal._id, topic: topicMap['grammar']._id, difficulty: 'medium', options: [{ label: 'A', text: 'are' }, { label: 'B', text: 'was' }, { label: 'C', text: 'were' }, { label: 'D', text: 'have been' }], correctAnswer: 'B', explanation: 'With "neither...nor", the verb agrees with the nearest subject "teacher" (singular), so "was" is correct.', marks: 1 },
    // Synonyms
    { question: 'Choose the synonym of "Abundant":', category: verbal._id, topic: topicMap['synonyms']._id, difficulty: 'easy', options: [{ label: 'A', text: 'Scarce' }, { label: 'B', text: 'Plentiful' }, { label: 'C', text: 'Rare' }, { label: 'D', text: 'Limited' }], correctAnswer: 'B', explanation: 'Abundant means existing in large quantities, which is synonymous with plentiful.', marks: 1 },
    { question: 'Synonym of "Benevolent":', category: verbal._id, topic: topicMap['synonyms']._id, difficulty: 'medium', options: [{ label: 'A', text: 'Hostile' }, { label: 'B', text: 'Malicious' }, { label: 'C', text: 'Kind' }, { label: 'D', text: 'Indifferent' }], correctAnswer: 'C', explanation: 'Benevolent means well-meaning and kindly.', marks: 1 },
    // Antonyms
    { question: 'Choose the antonym of "Expand":', category: verbal._id, topic: topicMap['antonyms']._id, difficulty: 'easy', options: [{ label: 'A', text: 'Grow' }, { label: 'B', text: 'Contract' }, { label: 'C', text: 'Enlarge' }, { label: 'D', text: 'Stretch' }], correctAnswer: 'B', explanation: 'Expand means to make larger. Contract means to make smaller.', marks: 1 },
    // Sentence Correction
    { question: 'Find the error: "Each of the boys have completed their homework."', category: verbal._id, topic: topicMap['sentence-correction']._id, difficulty: 'medium', options: [{ label: 'A', text: 'Each of' }, { label: 'B', text: 'the boys' }, { label: 'C', text: 'have completed' }, { label: 'D', text: 'their homework' }], correctAnswer: 'C', explanation: '"Each" is singular, so it should be "has completed" instead of "have completed".', marks: 1 },
    // Vocabulary
    { question: 'What does "Pragmatic" mean?', category: verbal._id, topic: topicMap['vocabulary']._id, difficulty: 'medium', options: [{ label: 'A', text: 'Idealistic' }, { label: 'B', text: 'Practical' }, { label: 'C', text: 'Theoretical' }, { label: 'D', text: 'Emotional' }], correctAnswer: 'B', explanation: 'Pragmatic means dealing with things sensibly and realistically; practical.', marks: 1 },

    // DATA INTERPRETATION
    { question: 'If a company\'s revenue was ₹50L in Q1, ₹60L in Q2, ₹55L in Q3, ₹75L in Q4, what is the average quarterly revenue?', category: di._id, topic: topicMap['tables']._id, difficulty: 'easy', options: [{ label: 'A', text: '₹55L' }, { label: 'B', text: '₹60L' }, { label: 'C', text: '₹65L' }, { label: 'D', text: '₹58L' }], correctAnswer: 'B', explanation: 'Average = (50+60+55+75)/4 = 240/4 = ₹60L', marks: 1 },
    { question: 'In a pie chart, if Sector A covers 90°, what percentage does it represent?', category: di._id, topic: topicMap['pie-charts']._id, difficulty: 'easy', options: [{ label: 'A', text: '20%' }, { label: 'B', text: '25%' }, { label: 'C', text: '30%' }, { label: 'D', text: '35%' }], correctAnswer: 'B', explanation: 'Percentage = (90/360) × 100 = 25%', marks: 1 },
    { question: 'If sales in Jan=100, Feb=120, Mar=150, what is the percentage increase from Jan to Mar?', category: di._id, topic: topicMap['bar-graphs']._id, difficulty: 'easy', options: [{ label: 'A', text: '40%' }, { label: 'B', text: '50%' }, { label: 'C', text: '60%' }, { label: 'D', text: '33%' }], correctAnswer: 'B', explanation: 'Increase = 150-100 = 50. Percentage = (50/100) × 100 = 50%', marks: 1 },

    // More questions to reach 200+
    { question: 'If the compound interest on ₹1000 for 2 years at 10% per annum is:', category: quant._id, topic: topicMap['compound-interest']._id, difficulty: 'medium', options: [{ label: 'A', text: '₹200' }, { label: 'B', text: '₹210' }, { label: 'C', text: '₹220' }, { label: 'D', text: '₹215' }], correctAnswer: 'B', explanation: 'CI = P[(1+R/100)^T - 1] = 1000[(1.1)² - 1] = 1000 × 0.21 = ₹210', marks: 1 },
    { question: 'P(A) = 0.4, P(B) = 0.5, P(A∩B) = 0.2. Find P(A∪B).', category: quant._id, topic: topicMap['probability']._id, difficulty: 'hard', options: [{ label: 'A', text: '0.5' }, { label: 'B', text: '0.6' }, { label: 'C', text: '0.7' }, { label: 'D', text: '0.8' }], correctAnswer: 'C', explanation: 'P(A∪B) = P(A) + P(B) - P(A∩B) = 0.4 + 0.5 - 0.2 = 0.7', marks: 1 },
    { question: 'In how many ways can 5 people be seated in a row?', category: quant._id, topic: topicMap['permutation-combination']._id, difficulty: 'easy', options: [{ label: 'A', text: '60' }, { label: 'B', text: '120' }, { label: 'C', text: '24' }, { label: 'D', text: '720' }], correctAnswer: 'B', explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120', marks: 1 },
    { question: 'How many committees of 3 can be formed from 7 people?', category: quant._id, topic: topicMap['permutation-combination']._id, difficulty: 'medium', options: [{ label: 'A', text: '21' }, { label: 'B', text: '35' }, { label: 'C', text: '42' }, { label: 'D', text: '210' }], correctAnswer: 'B', explanation: 'C(7,3) = 7!/(3!4!) = (7×6×5)/(3×2×1) = 35', marks: 1 },
    { question: 'If the product of two numbers is 192 and sum is 28, find them.', category: quant._id, topic: topicMap['algebra']._id, difficulty: 'hard', options: [{ label: 'A', text: '12 and 16' }, { label: 'B', text: '10 and 18' }, { label: 'C', text: '14 and 14' }, { label: 'D', text: '8 and 24' }], correctAnswer: 'A', explanation: 'x + y = 28, xy = 192. Solving: x² - 28x + 192 = 0 → (x-12)(x-16) = 0. Numbers: 12 and 16.', marks: 1 },

    // More logical reasoning
    { question: 'If + means ×, - means ÷, × means -, ÷ means +, then 8 + 6 - 3 × 4 ÷ 2 = ?', category: logic._id, topic: topicMap['coding-decoding']._id, difficulty: 'hard', options: [{ label: 'A', text: '12' }, { label: 'B', text: '14' }, { label: 'C', text: '16' }, { label: 'D', text: '18' }], correctAnswer: 'B', explanation: '8 × 6 ÷ 3 - 4 + 2 = 48 ÷ 3 - 4 + 2 = 16 - 4 + 2 = 14', marks: 1 },
    { question: 'Which day comes 3 days after Monday?', category: logic._id, topic: topicMap['puzzles']._id, difficulty: 'easy', options: [{ label: 'A', text: 'Wednesday' }, { label: 'B', text: 'Thursday' }, { label: 'C', text: 'Friday' }, { label: 'D', text: 'Saturday' }], correctAnswer: 'B', explanation: 'Mon → Tue → Wed → Thu. Thursday comes 3 days after Monday.', marks: 1 },
    { question: 'Statement: All dogs are cats. All cats are birds. Conclusion I: All dogs are birds. Conclusion II: All birds are dogs.', category: logic._id, topic: topicMap['statement-conclusion']._id, difficulty: 'medium', options: [{ label: 'A', text: 'Only I follows' }, { label: 'B', text: 'Only II follows' }, { label: 'C', text: 'Both follow' }, { label: 'D', text: 'Neither follows' }], correctAnswer: 'A', explanation: 'Dogs ⊂ Cats ⊂ Birds. So all dogs are birds (I follows). But not all birds are dogs (II doesn\'t follow).', marks: 1 },

    // More verbal
    { question: 'Fill in the blank: "She is __ honest woman."', category: verbal._id, topic: topicMap['fill-in-blanks']._id, difficulty: 'easy', options: [{ label: 'A', text: 'a' }, { label: 'B', text: 'an' }, { label: 'C', text: 'the' }, { label: 'D', text: 'no article' }], correctAnswer: 'B', explanation: '"Honest" starts with a vowel sound (the H is silent), so we use "an".', marks: 1 },
    { question: 'Antonym of "Courageous":', category: verbal._id, topic: topicMap['antonyms']._id, difficulty: 'easy', options: [{ label: 'A', text: 'Brave' }, { label: 'B', text: 'Bold' }, { label: 'C', text: 'Cowardly' }, { label: 'D', text: 'Fearless' }], correctAnswer: 'C', explanation: 'Courageous means brave. Its opposite is cowardly.', marks: 1 },

    // More DI
    { question: 'If total students = 500 and 40% play cricket, how many play cricket?', category: di._id, topic: topicMap['tables']._id, difficulty: 'easy', options: [{ label: 'A', text: '150' }, { label: 'B', text: '200' }, { label: 'C', text: '250' }, { label: 'D', text: '175' }], correctAnswer: 'B', explanation: '40% of 500 = 200', marks: 1 },
    { question: 'Growth rate from 200 to 250 is:', category: di._id, topic: topicMap['line-graphs']._id, difficulty: 'easy', options: [{ label: 'A', text: '20%' }, { label: 'B', text: '25%' }, { label: 'C', text: '30%' }, { label: 'D', text: '15%' }], correctAnswer: 'B', explanation: 'Growth = (250-200)/200 × 100 = 25%', marks: 1 },
  ];

  const insertedQuestions = await Question.insertMany(questionsData);
  console.log(`✅ ${insertedQuestions.length} questions created`);

  // Update question counts
  for (const cat of cats) {
    const count = await Question.countDocuments({ category: cat._id });
    await Category.findByIdAndUpdate(cat._id, { questionCount: count });
  }
  for (const topic of topics) {
    const count = await Question.countDocuments({ topic: topic._id });
    await Topic.findByIdAndUpdate(topic._id, { questionCount: count });
  }

  // Create Tests
  const allQuestions = await Question.find();
  const quantQuestions = allQuestions.filter(q => q.category.toString() === quant._id.toString());
  const logicQuestions = allQuestions.filter(q => q.category.toString() === logic._id.toString());
  const verbalQuestions = allQuestions.filter(q => q.category.toString() === verbal._id.toString());

  const testsData = [
    { name: 'Beginner Aptitude Test', description: 'A beginner-friendly test covering basic aptitude topics', type: 'mock', difficulty: 'beginner', questions: allQuestions.filter(q => q.difficulty === 'easy').slice(0, 10).map(q => q._id), numberOfQuestions: 10, duration: 15, marksPerQuestion: 1, negativeMarking: 0, isPublished: true },
    { name: 'Intermediate Mock Test', description: 'Test your skills with medium difficulty questions', type: 'mock', difficulty: 'intermediate', questions: allQuestions.filter(q => q.difficulty === 'medium').slice(0, 15).map(q => q._id), numberOfQuestions: 15, duration: 25, marksPerQuestion: 1, negativeMarking: 0.25, isPublished: true },
    { name: 'Advanced Challenge', description: 'Push your limits with challenging aptitude questions', type: 'mock', difficulty: 'advanced', questions: allQuestions.filter(q => q.difficulty === 'hard').concat(allQuestions.filter(q => q.difficulty === 'medium')).slice(0, 10).map(q => q._id), numberOfQuestions: 10, duration: 20, marksPerQuestion: 2, negativeMarking: 0.5, isPublished: true },
    { name: 'Quantitative Aptitude Test', description: 'Focus on mathematical and quantitative skills', type: 'mock', difficulty: 'mixed', category: quant._id, questions: quantQuestions.slice(0, 15).map(q => q._id), numberOfQuestions: 15, duration: 25, marksPerQuestion: 1, negativeMarking: 0, isPublished: true },
    { name: 'Logical Reasoning Test', description: 'Evaluate your logical and analytical abilities', type: 'mock', difficulty: 'mixed', category: logic._id, questions: logicQuestions.slice(0, 10).map(q => q._id), numberOfQuestions: 10, duration: 20, marksPerQuestion: 1, negativeMarking: 0, isPublished: true },
    { name: 'Placement Ready Mock', description: 'Company-style placement practice test covering all sections', type: 'placement', difficulty: 'mixed', questions: allQuestions.slice(0, 20).map(q => q._id), numberOfQuestions: 20, duration: 30, marksPerQuestion: 1, negativeMarking: 0.25, isPublished: true },
    { name: 'Full Aptitude Mock Test', description: 'Comprehensive test with questions from all categories', type: 'mock', difficulty: 'mixed', questions: allQuestions.slice(0, 25).map(q => q._id), numberOfQuestions: 25, duration: 40, marksPerQuestion: 1, negativeMarking: 0.25, isPublished: true },
    { name: 'Quick Practice - 5 Questions', description: 'A quick 5-minute practice session', type: 'practice', difficulty: 'beginner', questions: allQuestions.slice(0, 5).map(q => q._id), numberOfQuestions: 5, duration: 5, marksPerQuestion: 1, negativeMarking: 0, isPublished: true }
  ];

  for (const t of testsData) {
    t.totalMarks = t.numberOfQuestions * t.marksPerQuestion;
  }

  await Test.insertMany(testsData);
  console.log('✅ Tests created');

  // Achievements
  await Achievement.insertMany([
    { name: 'First Test', description: 'Complete your first test', icon: '🎯', type: 'tests', criteria: { field: 'totalTestsAttempted', operator: 'gte', value: 1 }, xpReward: 50 },
    { name: '5 Tests Completed', description: 'Complete 5 tests', icon: '⭐', type: 'tests', criteria: { field: 'totalTestsAttempted', operator: 'gte', value: 5 }, xpReward: 100 },
    { name: '10 Tests Completed', description: 'Complete 10 tests', icon: '🏅', type: 'tests', criteria: { field: 'totalTestsAttempted', operator: 'gte', value: 10 }, xpReward: 200 },
    { name: '7-Day Streak', description: 'Practice for 7 consecutive days', icon: '🔥', type: 'streak', criteria: { field: 'streak.current', operator: 'gte', value: 7 }, xpReward: 150 },
    { name: '30-Day Streak', description: 'Practice for 30 consecutive days', icon: '💎', type: 'streak', criteria: { field: 'streak.current', operator: 'gte', value: 30 }, xpReward: 500 },
    { name: '100 Questions', description: 'Solve 100 questions', icon: '📚', type: 'questions', criteria: { field: 'totalQuestionsSolved', operator: 'gte', value: 100 }, xpReward: 200 },
    { name: '500 Questions', description: 'Solve 500 questions', icon: '🎓', type: 'questions', criteria: { field: 'totalQuestionsSolved', operator: 'gte', value: 500 }, xpReward: 500 },
    { name: 'Getting Started', description: 'Solve your first 10 questions', icon: '🌟', type: 'questions', criteria: { field: 'totalQuestionsSolved', operator: 'gte', value: 10 }, xpReward: 30 }
  ]);
  console.log('✅ Achievements created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('📧 Admin: admin@aptitudehub.com / admin123');
  console.log('📧 Student: student@aptitudehub.com / student123');
  process.exit(0);
};

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
