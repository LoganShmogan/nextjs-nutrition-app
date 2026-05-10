// Author: Marty Orchard
// Area: Frontend / UI

import styles from "@/app/summary/page.module.css";

const summaryItems = [
  {
    label: "Energy",
    value: "1,850 kcal",
    target: "Target: 2,100 kcal",
    status: "Slightly under",
    statusType: "warning",
  },
  {
    label: "Protein",
    value: "72 g",
    target: "Target: 70 g",
    status: "Meeting target",
    statusType: "success",
  },
  {
    label: "Carbohydrates",
    value: "230 g",
    target: "Target: 260 g",
    status: "Slightly under",
    statusType: "warning",
  },
  {
    label: "Fat",
    value: "62 g",
    target: "Target: 70 g",
    status: "Within range",
    statusType: "success",
  },
];

