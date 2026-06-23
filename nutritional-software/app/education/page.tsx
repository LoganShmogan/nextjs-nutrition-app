"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type Tab = "nutrients" | "rdis" | "quiz" | "case-study";

const NUTRIENTS = [
  { name: "Protein", info: "Builds and repairs body tissues, muscles, and organs. Essential for enzyme and hormone production.", rdi: "0.8g per kg body weight (adults)" },
  { name: "Carbohydrates", info: "The body's primary energy source. Includes sugars, starches, and dietary fibre. Choose whole grains over refined.", rdi: "45-65% of total energy intake" },
  { name: "Fat", info: "Provides energy, supports cell growth, protects organs, and helps absorb fat-soluble vitamins (A, D, E, K).", rdi: "20-35% of total energy intake" },
  { name: "Fibre", info: "Aids digestion, helps maintain bowel health, lowers cholesterol, and helps control blood sugar.", rdi: "25-30g per day (adults)" },
  { name: "Calcium", info: "Essential for strong bones and teeth, muscle function, nerve signalling, and blood clotting.", rdi: "1000mg per day (adults 19-50)" },
  { name: "Iron", info: "Carries oxygen in the blood via haemoglobin. Deficiency causes fatigue and anaemia. Higher needs for females.", rdi: "8mg (males), 18mg (females)" },
  { name: "Vitamin C", info: "Supports immune function, wound healing, and collagen production. Acts as an antioxidant.", rdi: "45mg per day (adults)" },
  { name: "Sodium", info: "Regulates fluid balance and nerve function. Excess intake linked to high blood pressure.", rdi: "Less than 2300mg per day" },
  { name: "Sugar", info: "Provides quick energy but excess consumption linked to obesity, diabetes, and dental issues. Limit added sugars.", rdi: "Less than 10% of total energy" },
  { name: "Energy (kcal)", info: "Calories measure the energy content of food. Your total daily energy expenditure (TDEE) depends on BMR and activity level.", rdi: "Varies by age, gender, and activity" },
];

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const QUIZ: QuizQuestion[] = [
  {
    question: "Which macronutrient is the body's primary source of energy?",
    options: ["Protein", "Fat", "Carbohydrates", "Vitamins"],
    correct: 2,
    explanation: "Carbohydrates are broken down into glucose, which is the body's preferred fuel source.",
  },
  {
    question: "What does BMR stand for?",
    options: ["Body Mass Ratio", "Basal Metabolic Rate", "Basic Mineral Requirement", "Body Measurement Reading"],
    correct: 1,
    explanation: "Basal Metabolic Rate is the number of calories your body needs at rest to maintain basic life functions.",
  },
  {
    question: "Which mineral is most important for oxygen transport in the blood?",
    options: ["Calcium", "Sodium", "Iron", "Potassium"],
    correct: 2,
    explanation: "Iron is a key component of haemoglobin, which carries oxygen from the lungs to the rest of the body.",
  },
  {
    question: "What is the recommended daily sodium intake for adults?",
    options: ["Less than 500mg", "Less than 1000mg", "Less than 2300mg", "Less than 5000mg"],
    correct: 2,
    explanation: "Health guidelines recommend limiting sodium to less than 2300mg per day to reduce hypertension risk.",
  },
  {
    question: "Which vitamin is important for immune function and is found in citrus fruits?",
    options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
    correct: 2,
    explanation: "Vitamin C supports the immune system and acts as an antioxidant. Citrus fruits are excellent sources.",
  },
  {
    question: "What does TDEE stand for?",
    options: ["Total Daily Energy Expenditure", "Total Dietary Element Estimate", "Tracked Daily Eating Evaluation", "Total Daily Exercise Effort"],
    correct: 0,
    explanation: "TDEE is your BMR multiplied by an activity factor, representing total calories burned in a day.",
  },
  {
    question: "Which of these is NOT a function of dietary fat?",
    options: ["Absorbing vitamins A, D, E, K", "Providing energy", "Building haemoglobin", "Protecting organs"],
    correct: 2,
    explanation: "Haemoglobin is built using iron and protein, not fat. Fat serves many other important functions.",
  },
  {
    question: "A patient with a BMI of 27 would be classified as:",
    options: ["Underweight", "Normal weight", "Overweight", "Obese"],
    correct: 2,
    explanation: "BMI 25-29.9 is classified as overweight. Normal is 18.5-24.9, and obese is 30+.",
  },
];

export default function EducationPage() {
  const [tab, setTab] = useState<Tab>("nutrients");
  const [answers, setAnswers] = useState<Record<number, number>>({});

  function handleAnswer(qIndex: number, optIndex: number) {
    if (answers[qIndex] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  function resetQuiz() {
    setAnswers({});
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([qi, ai]) => QUIZ[Number(qi)].correct === ai
  ).length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.backLink}>
            &larr; Dashboard
          </Link>
          <h1>Nutrition Education</h1>
          <p>Learn about nutrients, recommended dietary intakes, and test your knowledge.</p>
        </div>

        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${tab === "nutrients" ? styles.active : ""}`} onClick={() => setTab("nutrients")}>
            Nutrient Guide
          </button>
          <button type="button" className={`${styles.tab} ${tab === "rdis" ? styles.active : ""}`} onClick={() => setTab("rdis")}>
            Understanding RDIs
          </button>
          <button type="button" className={`${styles.tab} ${tab === "quiz" ? styles.active : ""}`} onClick={() => setTab("quiz")}>
            Quiz
          </button>
          <button type="button" className={`${styles.tab} ${tab === "case-study" ? styles.active : ""}`} onClick={() => setTab("case-study")}>
            Case Study
          </button>
        </div>

        {tab === "nutrients" && (
          <div className={styles.card}>
            <h2>Nutrient Guide</h2>
            <p>
              Understanding the role of each nutrient helps in assessing
              whether a patient&apos;s diet is meeting their needs.
            </p>

            <div className={styles.nutrientGrid}>
              {NUTRIENTS.map((n) => (
                <div key={n.name} className={styles.nutrientItem}>
                  <h4>{n.name}</h4>
                  <p>{n.info}</p>
                  <p className={styles.rdi}>RDI: {n.rdi}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rdis" && (
          <div className={styles.card}>
            <h2>Understanding Recommended Dietary Intakes</h2>

            <h3>What are RDIs?</h3>
            <p>
              Recommended Dietary Intakes (RDIs) are the average daily intake levels
              of nutrients considered sufficient to meet the requirements of nearly
              all (97-98%) healthy individuals in a particular age and gender group.
            </p>

            <h3>How are RDIs determined?</h3>
            <p>
              RDIs are set by nutrition authorities (e.g., NHMRC in Australia/NZ)
              based on scientific evidence about the amount of each nutrient needed
              to prevent deficiency and support optimal health. They consider age,
              gender, pregnancy, and lactation status.
            </p>

            <h3>RDI vs. Actual Intake</h3>
            <p>
              When comparing a patient&apos;s intake to RDIs, a value below 80% of
              the target may indicate a deficiency risk, while above 120% may
              indicate excess. Some nutrients (like sodium) have upper limits where
              exceeding them poses health risks.
            </p>

            <h3>Key Concepts</h3>
            <p>
              <strong>BMR (Basal Metabolic Rate):</strong> The energy your body
              needs at complete rest — breathing, circulation, cell production.
              Calculated using the Mifflin-St Jeor equation based on weight,
              height, age, and gender.
            </p>
            <p>
              <strong>TDEE (Total Daily Energy Expenditure):</strong> Your BMR
              multiplied by an activity factor. Sedentary (x1.2), Lightly Active
              (x1.375), Active (x1.55), Very Active (x1.725).
            </p>
            <p>
              <strong>BMI (Body Mass Index):</strong> A screening tool calculated
              as weight(kg) / height(m)². Categories: Underweight (&lt;18.5),
              Normal (18.5-24.9), Overweight (25-29.9), Obese (30+).
            </p>
          </div>
        )}

        {tab === "quiz" && (
          <div className={styles.card}>
            <h2>Nutrition Knowledge Quiz</h2>
            <p>Test your understanding of key nutrition concepts. Select an answer for each question.</p>

            <div className={styles.quizSection}>
              {QUIZ.map((q, qi) => {
                const answered = answers[qi] !== undefined;
                const isCorrect = answers[qi] === q.correct;

                return (
                  <div key={qi} className={styles.question}>
                    <p>{qi + 1}. {q.question}</p>
                    <div className={styles.options}>
                      {q.options.map((opt, oi) => {
                        let cls = styles.option;
                        if (answered) {
                          cls += ` ${styles.disabled}`;
                          if (oi === q.correct) cls += ` ${styles.correct}`;
                          else if (oi === answers[qi]) cls += ` ${styles.wrong}`;
                        }
                        return (
                          <button
                            key={oi}
                            type="button"
                            className={cls}
                            onClick={() => handleAnswer(qi, oi)}
                            disabled={answered}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {answered && (
                      <p className={`${styles.feedback} ${isCorrect ? styles.correct : styles.wrong}`}>
                        {isCorrect ? "Correct! " : "Incorrect. "}
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}

              {answeredCount === QUIZ.length && (
                <>
                  <div className={styles.score}>
                    Score: {correctCount} / {QUIZ.length}
                  </div>
                  <button type="button" className={styles.resetBtn} onClick={resetQuiz}>
                    Retry Quiz
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "case-study" && (
          <div className={styles.card}>
            <h2>Case Study: Dietary Assessment</h2>
            <p>
              Practice analysing a patient scenario. Read the case below and
              consider what nutritional concerns or recommendations you would make.
            </p>

            <div className={styles.caseStudy}>
              <h4>Patient: Sarah, 22-year-old female nursing student</h4>
              <p>
                Sarah is a 22-year-old female, 165cm tall, weighing 58kg. She
                describes herself as &quot;lightly active&quot; — she walks to
                university most days but does not exercise regularly. She reports
                feeling tired frequently and has noticed her hair is thinner than
                usual.
              </p>
              <p><strong>Yesterday&apos;s food diary:</strong></p>
              <ul>
                <li>Breakfast: Black coffee, 1 slice white toast with jam</li>
                <li>Lunch: Small Caesar salad (no chicken)</li>
                <li>Dinner: Pasta with butter and parmesan</li>
                <li>Snacks: 2 biscuits, 1 can of soft drink</li>
              </ul>
            </div>

            <h3>Questions to Consider</h3>
            <p>
              1. Estimate Sarah&apos;s BMR and TDEE using her profile data. Is her
              likely calorie intake meeting her needs?
            </p>
            <p>
              2. Identify which nutrients are likely deficient based on her food
              diary. Consider protein, iron, calcium, vitamin C, and fibre.
            </p>
            <p>
              3. Sarah reports fatigue and hair thinning. Which nutrient
              deficiencies could explain these symptoms? (Hint: consider iron and
              protein.)
            </p>
            <p>
              4. What practical dietary changes would you recommend to address the
              identified deficiencies?
            </p>
            <p>
              5. Try entering Sarah&apos;s profile and food log into the app to run
              an actual RDI analysis. Compare your estimates to the app&apos;s
              results.
            </p>

            <div className={styles.caseStudy}>
              <h4>Discussion Points</h4>
              <p>
                Sarah&apos;s diet is low in protein (no significant protein sources
                at any meal), likely low in iron (no red meat, legumes, or
                iron-rich vegetables), and low in calcium (minimal dairy). The
                refined carbohydrates and sugar from soft drink and biscuits
                provide energy but little nutritional value. Her fatigue and hair
                thinning are classic signs of iron and/or protein deficiency.
              </p>
              <p>
                Recommended changes: add a protein source to each meal (eggs at
                breakfast, chicken or legumes at lunch/dinner), include iron-rich
                foods (lean red meat, spinach, lentils), add calcium sources
                (yoghurt, milk, cheese), and replace sugary snacks with fruit or
                nuts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
