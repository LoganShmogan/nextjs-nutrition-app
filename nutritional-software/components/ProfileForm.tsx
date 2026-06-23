"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/profile/page.module.css";

type ProfileFormData = {
  id: string;
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
  beepTestLevel: string;
  vo2Max: string;
  restingHeartRate: string;
  bloodPressure: string;
};

type EnergyExpenditureResult = {
  bmrKcal: number;
  tdeeKcal: number;
  activityMultiplier: number;
  activityLevel: string;
  formula: string;
  bmi: number;
  bmiCategory: string;
  notes: string[];
};

const initialFormData: ProfileFormData = {
  id: "",
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
  beepTestLevel: "",
  vo2Max: "",
  restingHeartRate: "",
  bloodPressure: "",
};

export default function ProfileForm() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isNew = searchParams.get("new") === "true";

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [submittedProfile, setSubmittedProfile] = useState<ProfileFormData | null>(null);
  const [energyExpenditure, setEnergyExpenditure] = useState<EnergyExpenditureResult | null>(null);
  const [energyError, setEnergyError] = useState<string | null>(null);

  const previewCardRef = useRef<HTMLElement | null>(null);
  const [matchedCardHeight, setMatchedCardHeight] = useState<number | null>(null);

  useEffect(() => {
    if (isNew) return;

    if (editId) {
      fetch(`/api/profile?all=true`)
        .then((r) => r.json())
        .then((data) => {
          const p = (data.profiles ?? []).find(
            (prof: Record<string, unknown>) => String(prof.id) === editId
          );
          if (p) populateForm(p);
        })
        .catch(() => {});
    } else {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.profile) populateForm(data.profile);
        })
        .catch(() => {});
    }
  }, [editId, isNew]);

  function populateForm(p: Record<string, unknown>) {
    setFormData({
      id:                  String(p.id ?? ""),
      patientName:         (p.patientName as string) ?? "",
      age:                 String(p.age ?? ""),
      gender:              (p.gender as string) ?? "",
      ethnicity:           (p.ethnicity as string) ?? "",
      weight:              String(p.weight ?? ""),
      height:              String(p.height ?? ""),
      activityLevel:       (p.activityLevel as string) ?? "",
      measurementSystem:   (p.measurementSystem as string) ?? "Metric",
      nutritionGoal:       (p.nutritionGoal as string) ?? "",
      dietaryPreference:   (p.dietaryPreference as string) ?? "",
      dietaryRestrictions: (p.dietaryRestrictions as string) ?? "",
      allergies:           (p.allergies as string) ?? "",
      medicalConditions:   (p.medicalConditions as string) ?? "",
      medications:         (p.medications as string) ?? "",
      additionalNotes:     (p.additionalNotes as string) ?? "",
      beepTestLevel:       (p.beepTestLevel as string) ?? "",
      vo2Max:              String(p.vo2Max ?? ""),
      restingHeartRate:    String(p.restingHeartRate ?? ""),
      bloodPressure:       (p.bloodPressure as string) ?? "",
    });
  }

  useEffect(() => {
    if (!submittedProfile || !previewCardRef.current) {
      setMatchedCardHeight(null);
      return;
    }

    const updateHeight = () => {
      const previewHeight = previewCardRef.current?.offsetHeight ?? null;
      setMatchedCardHeight(previewHeight);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [submittedProfile, energyExpenditure]);

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmittedProfile(formData);
    setEnergyExpenditure(null);
    setEnergyError(null);

    const profilePayload: Record<string, unknown> = {
      ...formData,
      age:    Number(formData.age),
      weight: Number(formData.weight),
      height: Number(formData.height),
    };

    if (isNew) {
      delete profilePayload.id;
    } else if (formData.id) {
      profilePayload.id = Number(formData.id);
    }

    if (formData.vo2Max) profilePayload.vo2Max = Number(formData.vo2Max);
    if (formData.restingHeartRate) profilePayload.restingHeartRate = Number(formData.restingHeartRate);

    try {
      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });
      const profileData = await profileRes.json();
      if (profileData.profile?.id && !formData.id) {
        setFormData((prev) => ({ ...prev, id: String(profileData.profile.id) }));
      }
    } catch {}

    try {
      const response = await fetch("/api/energy-expenditure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Energy expenditure could not be calculated.");
      }

      setEnergyExpenditure(result.energyExpenditure);
    } catch (error) {
      setEnergyError(
        error instanceof Error
          ? error.message
          : "Energy expenditure could not be calculated.",
      );
    }
  }

  function handleReset() {
    setFormData(initialFormData);
    setSubmittedProfile(null);
    setEnergyExpenditure(null);
    setEnergyError(null);
  }

  const heading = isNew ? "New Patient Profile" : "Edit Patient Profile";

  return (
    <section className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <h1>{heading}</h1>
        <p>
          Enter patient information so the nutrition app can estimate BMR, TDEE,
          BMI, and activity-adjusted energy needs.
        </p>
      </div>

      <div className={styles.profileLayout}>
        <form
          className={styles.profileFormCard}
          style={
            matchedCardHeight
              ? { minHeight: `${matchedCardHeight}px` }
              : undefined
          }
          onSubmit={handleSubmit}
        >
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
              <select name="gender" value={formData.gender} onChange={handleChange} required>
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
              <select name="measurementSystem" value={formData.measurementSystem} onChange={handleChange} required>
                <option value="Metric">Metric kg/cm</option>
                <option value="Imperial">Imperial lb/ft</option>
              </select>
            </label>

            <label>
              Activity level *
              <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} required>
                <option value="">Select activity level</option>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly active">Lightly active</option>
                <option value="Active">Active</option>
                <option value="Very active">Very active</option>
              </select>
            </label>

            <label>
              Weight ({formData.measurementSystem === "Imperial" ? "lb" : "kg"}) *
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
              Height ({formData.measurementSystem === "Imperial" ? "in" : "cm"}) *
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
          </div>

          <div className={styles.formGrid}>
            <label>
              Nutrition goal
              <select name="nutritionGoal" value={formData.nutritionGoal} onChange={handleChange}>
                <option value="">Select goal</option>
                <option value="General health">General health</option>
                <option value="Weight maintenance">Weight maintenance</option>
                <option value="Weight gain">Weight gain</option>
                <option value="Weight loss">Weight loss</option>
                <option value="Sports performance">Sports performance</option>
                <option value="Medical nutrition support">Medical nutrition support</option>
              </select>
            </label>

            <label>
              Dietary preference
              <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange}>
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
              <input type="text" name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} placeholder="e.g. gluten-free, low sodium" />
            </label>

            <label>
              Allergies / intolerances
              <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. peanuts, dairy, shellfish" />
            </label>

            <label className={styles.fullWidth}>
              Medical conditions
              <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} placeholder="e.g. diabetes, coeliac disease, hypertension" rows={3} />
            </label>

            <label className={styles.fullWidth}>
              Medications / supplements
              <textarea name="medications" value={formData.medications} onChange={handleChange} placeholder="e.g. iron supplement, insulin" rows={2} />
            </label>
          </div>

          <div className={styles.sectionDivider}>
            <h2>Fitness Assessment Results</h2>
            <p>Record results from fitness tests for historical reference.</p>
          </div>

          <div className={styles.formGrid}>
            <label>
              Beep test level
              <input type="text" name="beepTestLevel" value={formData.beepTestLevel} onChange={handleChange} placeholder="e.g. 8.5" />
            </label>

            <label>
              VO2 max (mL/kg/min)
              <input type="number" name="vo2Max" value={formData.vo2Max} onChange={handleChange} placeholder="e.g. 42" step="0.1" />
            </label>

            <label>
              Resting heart rate (bpm)
              <input type="number" name="restingHeartRate" value={formData.restingHeartRate} onChange={handleChange} placeholder="e.g. 68" />
            </label>

            <label>
              Blood pressure
              <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} placeholder="e.g. 120/80" />
            </label>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.fullWidth}>
              Additional notes
              <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} placeholder="Any extra notes relevant to the analysis" rows={2} />
            </label>
          </div>

          <div className={styles.formActions}>
            <button className={styles.primaryButton} type="submit">
              Save Profile &amp; Calculate Energy Needs
            </button>
            <button className={styles.secondaryButton} type="button" onClick={handleReset}>
              Clear Form
            </button>
          </div>
        </form>

        <aside ref={previewCardRef} className={styles.profilePreviewCard}>
          <h2>Profile Preview</h2>

          {!submittedProfile ? (
            <p className={styles.mutedText}>
              Submit the form to preview the captured profile details and
              calculate estimated energy expenditure.
            </p>
          ) : (
            <>
              {energyError && <p className={styles.errorText}>{energyError}</p>}

              {energyExpenditure && (
                <div className={styles.energyCard}>
                  <p className={styles.energyEyebrow}>Estimated Energy Needs</p>
                  <div className={styles.energyGrid}>
                    <div><span>BMR</span><strong>{energyExpenditure.bmrKcal} kcal/day</strong></div>
                    <div><span>TDEE</span><strong>{energyExpenditure.tdeeKcal} kcal/day</strong></div>
                    <div><span>BMI</span><strong>{energyExpenditure.bmi} · {energyExpenditure.bmiCategory}</strong></div>
                    <div><span>Activity multiplier</span><strong>{energyExpenditure.activityMultiplier}</strong></div>
                  </div>
                  <p className={styles.formulaText}>{energyExpenditure.formula}</p>
                </div>
              )}

              <div className={styles.previewList}>
                <div><span>Name</span><strong>{submittedProfile.patientName}</strong></div>
                <div><span>Age</span><strong>{submittedProfile.age}</strong></div>
                <div><span>Gender</span><strong>{submittedProfile.gender}</strong></div>
                <div><span>Measurement system</span><strong>{submittedProfile.measurementSystem}</strong></div>
                <div><span>Weight</span><strong>{submittedProfile.weight}</strong></div>
                <div><span>Height</span><strong>{submittedProfile.height}</strong></div>
                <div><span>Activity level</span><strong>{submittedProfile.activityLevel}</strong></div>
                <div><span>Nutrition goal</span><strong>{submittedProfile.nutritionGoal || "Not provided"}</strong></div>
                {submittedProfile.beepTestLevel && (
                  <div><span>Beep test</span><strong>Level {submittedProfile.beepTestLevel}</strong></div>
                )}
                {submittedProfile.vo2Max && (
                  <div><span>VO2 max</span><strong>{submittedProfile.vo2Max} mL/kg/min</strong></div>
                )}
                {submittedProfile.restingHeartRate && (
                  <div><span>Resting HR</span><strong>{submittedProfile.restingHeartRate} bpm</strong></div>
                )}
                {submittedProfile.bloodPressure && (
                  <div><span>Blood pressure</span><strong>{submittedProfile.bloodPressure}</strong></div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
