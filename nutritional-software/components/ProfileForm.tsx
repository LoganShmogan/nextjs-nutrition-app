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
        </section>
    );
}