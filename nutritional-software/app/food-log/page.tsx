// Author: Logan
// Area: Frontend / UI
// app/food-log/page.tsx

"use client";

import { useState } from "react";
import styles from "./page.module.css";

const mockFoods = [
	{
		id: 1,
		name: "Chicken Breast",
		calories: 165,
		protein: 31,
		carbs: 0,
		fat: 3.6,
		sodium: 74,
	},
	{
		id: 2,
		name: "White Rice",
		calories: 130,
		protein: 2.7,
		carbs: 28,
		fat: 0.3,
		sodium: 1,
	},
	{
		id: 3,
		name: "Banana",
		calories: 89,
		protein: 1.1,
		carbs: 23,
		fat: 0.3,
		sodium: 1,
	},
];

export default function FoodLogPage() {
	const [search, setSearch] = useState("");
	const [selectedFood, setSelectedFood] = useState<any>(null);

	const filteredFoods = mockFoods.filter((food) =>
		food.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<main className={styles.page}>
			<div className={styles.container}>
				<div className={styles.header}>
					<h1>Food Intake Logging</h1>
					<p>Track meals, nutrients, and custom foods.</p>
				</div>

				<div className={styles.grid}>
					{/* LEFT SIDE */}
					<section className={styles.card}>
						<h2>Food Database</h2>

						<input
							type="text"
							placeholder="Search foods..."
							className={styles.searchInput}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>

						<div className={styles.foodList}>
							{filteredFoods.map((food) => (
								<button
									key={food.id}
									className={styles.foodItem}
									onClick={() =>
										setSelectedFood(food)
									}
								>
									<div>
										<h3>{food.name}</h3>
										<p>
											{food.calories} kcal per
											100g
										</p>
									</div>
								</button>
							))}
						</div>
					</section>

					{/* RIGHT SIDE */}
					<section className={styles.card}>
						<h2>Log Food Intake</h2>

						{selectedFood ? (
							<>
								<div className={styles.selectedFood}>
									<h3>{selectedFood.name}</h3>

									<div className={styles.nutrients}>
										<div>
											<span>Calories</span>
											<strong>
												{
													selectedFood.calories
												}{" "}
												kcal
											</strong>
										</div>

										<div>
											<span>Protein</span>
											<strong>
												{
													selectedFood.protein
												}{" "}
												g
											</strong>
										</div>

										<div>
											<span>Carbs</span>
											<strong>
												{selectedFood.carbs}{" "}
												g
											</strong>
										</div>

										<div>
											<span>Fat</span>
											<strong>
												{selectedFood.fat} g
											</strong>
										</div>

										<div>
											<span>Sodium</span>
											<strong>
												{
													selectedFood.sodium
												}{" "}
												mg
											</strong>
										</div>
									</div>
								</div>

								<form className={styles.form}>
									<div className={styles.formGroup}>
										<label>Portion Size</label>

										<div
											className={
												styles.portionRow
											}
										>
											<input
												type="number"
												placeholder="Amount"
												min="0"
											/>

											<select>
												<option>
													grams (g)
												</option>
												<option>
													millilitres
													(mL)
												</option>
												<option>
													servings
												</option>
											</select>
										</div>
									</div>

									<div className={styles.formGroup}>
										<label>Date</label>
										<input type="date" />
									</div>

									<div className={styles.formGroup}>
										<label>Time</label>
										<input type="time" />
									</div>

									<div className={styles.formGroup}>
										<label>Meal Tag</label>

										<select>
											<option>
												Breakfast
											</option>
											<option>Lunch</option>
											<option>Dinner</option>
											<option>Snack</option>
										</select>
									</div>

									<button
										type="submit"
										className={
											styles.primaryButton
										}
									>
										Add to Food Log
									</button>
								</form>
							</>
						) : (
							<div className={styles.emptyState}>
								<p>
									Select a food item to begin
									logging.
								</p>
							</div>
						)}
					</section>
				</div>

				{/* CUSTOM FOOD SECTION */}
				<section className={styles.card}>
					<div className={styles.sectionHeader}>
						<h2>Add Custom Food / Recipe</h2>
						<p>
							Manually enter nutrient information if a food
							cannot be found.
						</p>
					</div>

					<form className={styles.customFoodForm}>
						<div className={styles.formGroup}>
							<label>Food / Recipe Name</label>
							<input
								type="text"
								placeholder="e.g. Homemade Protein Shake"
							/>
						</div>

						<div className={styles.formRow}>
							<div className={styles.formGroup}>
								<label>Calories</label>
								<input type="number" placeholder="0" />
							</div>

							<div className={styles.formGroup}>
								<label>Protein (g)</label>
								<input type="number" placeholder="0" />
							</div>

							<div className={styles.formGroup}>
								<label>Carbs (g)</label>
								<input type="number" placeholder="0" />
							</div>

							<div className={styles.formGroup}>
								<label>Fat (g)</label>
								<input type="number" placeholder="0" />
							</div>
						</div>

						<div className={styles.formRow}>
							<div className={styles.formGroup}>
								<label>Fiber (g)</label>
								<input type="number" placeholder="0" />
							</div>

							<div className={styles.formGroup}>
								<label>Sodium (mg)</label>
								<input type="number" placeholder="0" />
							</div>

							<div className={styles.formGroup}>
								<label>Sugar (g)</label>
								<input type="number" placeholder="0" />
							</div>
						</div>

						<button
							type="submit"
							className={styles.secondaryButton}
						>
							Save Custom Food
						</button>
					</form>
				</section>
			</div>
		</main>
	);
}
