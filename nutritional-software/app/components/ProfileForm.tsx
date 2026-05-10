// Author: Marty
// Area: Frontend / UI

"use client";

import { useState } from "react";

type ProfileFormData = 
{
    patientName: string;
    age: string;
    gender: string;
    ethnicity: string;
    height: string;
    weight: string;
    activityLevel: string;
    dietaryRestrictions: string;
    medicalConditions: string;

}