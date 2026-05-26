"use client";

// Author: Marty Orchard
// Area: Frontend / UI

import { useState } from "react";
import styles from "@/app/profile/page.module.css";

type ProfileFormData = {
  patientName: string;
  age: string;
  gender: string;
  ethnicity: string;
  weight: string;
  height: string;
  activityLevel: string;
  measurementSystem: string;
  nutritionGoal: string;
  dietaryPreference: string;
  dietaryRestrictions: string;
  allergies: string;
  medicalConditions: string;
  medications: string;
  additionalNotes: string;
};

const initialFormData: ProfileFormData = {
  patientName: "",
  age: "",
  gender: "",
  ethnicity: "",
  weight: "",
  height: "",
  activityLevel: "",
  measurementSystem: "Metric",
  nutritionGoal: "",
  dietaryPreference: "",
  dietaryRestrictions: "",
  allergies: "",
  medicalConditions: "",
  medications: "",
  additionalNotes: "",
};

export default function ProfileForm() {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [submittedProfile, setSubmittedProfile] =
    useState<ProfileFormData | null>(null);

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedProfile(formData);
  }

  function handleReset() {
    setFormData(initialFormData);
    setSubmittedProfile(null);
  }

  return (
    <section className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <p className={styles.eyebrow}>Sprint 2 · Expanded Profile</p>
        <h1>User Profile Setup</h1>
        <p>
          Enter expanded patient information so the nutrition app can later
          provide more personalised dietary recommendations.
        </p>
      </div>

      <div className={styles.profileLayout}>
        <form className={styles.profileFormCard} onSubmit={handleSubmit}>
          <div className={styles.formSectionTitle}>
            <h2>Patient Information</h2>
            <p>Required fields are marked with an asterisk.</p>
          </div>

          <div className={styles.formGrid}>
            <label>
              Patient name *
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="e.g. Alex Taylor"
                required
              />
            </label>

            <label>
              Age *
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 21"
                min="1"
                max="120"
                required
              />
            </label>

            <label>
              Gender *
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>

            <label>
              Ethnicity
              <input
                type="text"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
                placeholder="Optional"
              />
            </label>

            <label>
              Measurement system *
              <select
                name="measurementSystem"
                value={formData.measurementSystem}
                onChange={handleChange}
                required
              >
                <option value="Metric">Metric kg/cm</option>
                <option value="Imperial">Imperial lb/ft</option>
              </select>
            </label>

            <label>
              Activity level *
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select activity level</option>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly active">Lightly active</option>
                <option value="Active">Active</option>
                <option value="Very active">Very active</option>
              </select>
            </label>

            <label>
              Weight *
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 70"
                min="1"
                step="0.1"
                required
              />
            </label>

            <label>
              Height *
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 175"
                min="1"
                step="0.1"
                required
              />
            </label>
          </div>

          <div className={styles.sectionDivider}>
            <h2>Health and Diet Details</h2>
            <p>
              These fields support safer and more personalised nutritional
              analysis in later sprints.
            </p>
          </div>

          <div className={styles.formGrid}>
            <label>
              Nutrition goal
              <select
                name="nutritionGoal"
                value={formData.nutritionGoal}
                onChange={handleChange}
              >
                <option value="">Select goal</option>
                <option value="General health">General health</option>
                <option value="Weight maintenance">Weight maintenance</option>
                <option value="Weight gain">Weight gain</option>
                <option value="Weight loss">Weight loss</option>
                <option value="Sports performance">Sports performance</option>
                <option value="Medical nutrition support">
                  Medical nutrition support
                </option>
              </select>
            </label>

            <label>
              Dietary preference
              <select
                name="dietaryPreference"
                value={formData.dietaryPreference}
                onChange={handleChange}
              >
                <option value="">Select preference</option>
                <option value="No preference">No preference</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Pescatarian">Pescatarian</option>
                <option value="Halal">Halal</option>
                <option value="Kosher">Kosher</option>
              </select>
            </label>

            <label>
              Dietary restrictions
              <input
                type="text"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleChange}
                placeholder="e.g. gluten-free, low sodium"
              />
            </label>

            <label>
              Allergies / intolerances
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. peanuts, dairy, shellfish"
              />
            </label>

            <label className={styles.fullWidth}>
              Medical conditions
              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                placeholder="e.g. diabetes, coeliac disease, hypertension"
                rows={4}
              />
            </label>

            <label className={styles.fullWidth}>
              Medications / supplements
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                placeholder="e.g. iron supplement, insulin, blood pressure medication"
                rows={3}
              />
            </label>

            <label className={styles.fullWidth}>
              Additional notes
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any extra notes relevant to the analysis"
                rows={3}
              />
            </label>
          </div>

          <div className={styles.formActions}>
            <button className={styles.primaryButton} type="submit">
              Save Expanded Profile
            </button>

            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleReset}
            >
              Clear Form
            </button>
          </div>
        </form>

        <aside className={styles.profilePreviewCard}>
          <h2>Profile Preview</h2>

          {!submittedProfile ? (
            <p className={styles.mutedText}>
              Submit the form to preview the captured profile details. This is
              frontend-only for Sprint 2.
            </p>
          ) : (
            <div className={styles.previewList}>
              <div>
                <span>Name</span>
                <strong>{submittedProfile.patientName}</strong>
              </div>

              <div>
                <span>Age</span>
                <strong>{submittedProfile.age}</strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>{submittedProfile.gender}</strong>
              </div>

              <div>
                <span>Ethnicity</span>
                <strong>{submittedProfile.ethnicity || "Not provided"}</strong>
              </div>
              
              <div>
                <span>Weight</span>
                <strong>{submittedProfile.weight || "Not provided"}</strong>
              </div>

              <div>
                <span>Height</span>
                <strong>{submittedProfile.height || "Not provided"}</strong>
              </div>

              <div>
                <span>Activity level</span>
                <strong>{submittedProfile.activityLevel}</strong>
              </div>

              <div>
                <span>Dietary restrictions</span>
                <strong>
                  {submittedProfile.dietaryRestrictions || "Not provided"}
                </strong>
              </div>
              <div>
                <span>Medical conditions</span>
                <strong>
                  {submittedProfile.medicalConditions || "Not provided"}
                </strong>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}