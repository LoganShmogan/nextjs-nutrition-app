"use client";

// Author: Marty Orchard
// Area: Frontend / UI

import { useState } from "react";
import styles from "@/app/analysis/page.module.css";

type AnalysisFormData = {
  analysisName: string;
  patientIdentifier: string;
  notes: string;
  date: string;
};

const initialFormData: AnalysisFormData = {
  analysisName: "Pregnancy Case Study - Day 1",
  patientIdentifier: "A.M",
  notes: "21 year old pregnant female",
  date: "2026-04-22",
};

export default function Analysis() {
  const [formData, setFormData] = useState<AnalysisFormData>(initialFormData);
  const [saved, setSaved] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setSaved(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  function handleCancel() {
    setFormData(initialFormData);
    setSaved(false);
  }

