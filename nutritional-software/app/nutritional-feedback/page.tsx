// app/nutritional-feedback/page.tsx

"use client";

import { useMemo } from "react";
import styles from "./page.module.css";

const dailyTotals = {
	calories: 2100,
	protein: 42,
	carbs: 260,
	fat: 78,
	sugar: 95,
	sodium: 2900,
};

const thresholds = {
	calories: {
		low: 1800,
		high: 2500,
	},
	protein: {
		low: 50,
	},
	carbs: {
		low: 130,
		high: 325,
	},
	fat: {
		high: 80,
	},
	sugar: {
		high: 90,
	},
	sodium: {
		high: 2300,
	},
};

export default function NutritionalFeedbackPage() {
	const feedback = useMemo(() => {
		return [
			{
				title: "Calories",
				value: `${dailyTotals.calories} kcal`,
				status:
					dailyTotals.calories < thresholds.calories.low
						? "low"
						: dailyTotals.calories > thresholds.calories.high
							? "high"
							: "good",
				message:
					dailyTotals.calories < thresholds.calories.low
						? "Calorie intake is below recommended range."
						: dailyTotals.calories > thresholds.calories.high
							? "Calorie intake is above recommended range."
							: "Calorie intake is within recommended range.",
			},

			{
				title: "Protein",
				value: `${dailyTotals.protein} g`,
				status:
					dailyTotals.protein < thresholds.protein.low
						? "low"
						: "good",
				message:
					dailyTotals.protein < thresholds.protein.low
						? "Protein intake is low."
						: "Protein intake looks good.",
			},

			{
				title: "Carbohydrates",
				value: `${dailyTotals.carbs} g`,
				status:
					dailyTotals.carbs < thresholds.carbs.low
						? "low"
						: dailyTotals.carbs > thresholds.carbs.high
							? "high"
							: "good",
				message:
					dailyTotals.carbs < thresholds.carbs.low
						? "Carbohydrate intake is below recommended range."
						: dailyTotals.carbs > thresholds.carbs.high
							? "Carbohydrate intake is above recommended range."
							: "Carbohydrate intake is within recommended range.",
			},

			{
				title: "Fat",
				value: `${dailyTotals.fat} g`,
				status:
					dailyTotals.fat > thresholds.fat.high
						? "high"
						: "good",
				message:
					dailyTotals.fat > thresholds.fat.high
						? "Fat intake is slightly high."
						: "Fat intake looks good.",
			},

			{
				title: "Sugar",
				value: `${dailyTotals.sugar} g`,
				status:
					dailyTotals.sugar > thresholds.sugar.high
						? "high"
						: "good",
				message:
					dailyTotals.sugar > thresholds.sugar.high
						? "Sugar intake exceeds recommended intake."
						: "Sugar intake is within recommended range.",
			},

			{
				title: "Sodium",
				value: `${dailyTotals.sodium} mg`,
				status:
					dailyTotals.sodium > thresholds.sodium.high
						? "high"
						: "good",
				message:
					dailyTotals.sodium > thresholds.sodium.high
						? "Sodium intake is too high."
						: "Sodium intake is within recommended range.",
			},
		];
	}, []);

	return (
		<main className={styles.page}>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1>Daily Nutritional Feedback</h1>

					<p>
						Simple nutritional analysis using hardcoded
						nutritional thresholds.
					</p>
				</div>

				<section className={styles.summaryCard}>
					<h2>Today's Intake Summary</h2>

					<div className={styles.summaryGrid}>
						<div>
							<span>Total Calories</span>
							<strong>{dailyTotals.calories} kcal</strong>
						</div>

						<div>
							<span>Protein</span>
							<strong>{dailyTotals.protein} g</strong>
						</div>

						<div>
							<span>Carbohydrates</span>
							<strong>{dailyTotals.carbs} g</strong>
						</div>

						<div>
							<span>Fat</span>
							<strong>{dailyTotals.fat} g</strong>
						</div>
					</div>
				</section>

				<section className={styles.feedbackSection}>
					{feedback.map((item) => (
						<div
							key={item.title}
							className={`${styles.feedbackCard} ${
								item.status === "good"
									? styles.good
									: item.status === "low"
										? styles.low
										: styles.high
							}`}
						>
							<div className={styles.cardHeader}>
								<div>
									<h3>{item.title}</h3>
									<p>{item.value}</p>
								</div>

								<div className={styles.statusBadge}>
									{item.status === "good" && "Good"}
									{item.status === "low" && "Low"}
									{item.status === "high" && "High"}
								</div>
							</div>

							<div className={styles.message}>
								<p>{item.message}</p>
							</div>
						</div>
					))}
				</section>
			</div>
		</main>
	);
}
