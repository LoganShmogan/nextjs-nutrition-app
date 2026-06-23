// Author: Marty Orchard

import { Suspense } from "react";
import ProfileForm from "@/components/ProfileForm";
import styles from "./page.module.css";

export default function ProfilePage() {
  return (
    <main className={styles.pageShell}>
      <Suspense>
        <ProfileForm />
      </Suspense>
    </main>
  );
}
