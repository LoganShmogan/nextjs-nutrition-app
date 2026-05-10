// Author: Marty Orchard
// Area: Frontend / UI

import ProfileForm from "@/components/ProfileForm";
import styles from "./page.module.css";

export default function ProfilePage() {
  return (
    <main className={styles.pageShell}>
      <ProfileForm />
    </main>
  );
}
