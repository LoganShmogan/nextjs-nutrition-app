// Author: Marty Orchard
// Area: Frontend / UI

"use client";

import { useState } from "react";

type ProfileFormData = {
  patientName: string;
  age: string;
  gender: string;
  ethnicity: string;
  weight: string;
  height: string;
  activityLevel: string;
  dietaryRestrictions: string;
  medicalConditions: string;
};

const initialFormData: ProfileFormData = {
  patientName: "",
  age: "",
  gender: "",
  ethnicity: "",
  weight: "",
  height: "",
  activityLevel: "",
  dietaryRestrictions: "",
  medicalConditions: "",
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
    <section className="profile-page">
      <div className="profile-header">
        <p className="eyebrow">Sprint 1 · Basic Version</p>
        <h1>User Profile Setup</h1>
        <p>
          Enter basic patient information so the nutrition app can later provide
          more personalised dietary recommendations.
        </p>
      </div>

      <div className="profile-layout">
        <form className="profile-form-card" onSubmit={handleSubmit}>
          <div className="form-section-title">
            <h2>Patient Information</h2>
            <p>Required fields are marked with an asterisk.</p>
          </div>

          <div className="form-grid">
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
              Weight kg *
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
              Height cm *
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

          )}
        </aside>
      </div>
    </section>
  );
}