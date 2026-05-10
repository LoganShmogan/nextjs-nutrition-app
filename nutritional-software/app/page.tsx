// Author: Marty
// Area: Frontend / UI

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.intro}>
					<Link href="/food-log">
						<u>Food Log page</u>
					</Link>
					<Link href="/profile">
						<u>Profile</u>
					</Link>
					<Link href="/summary">
						<u>Summary</u>
					</Link>
					<Link href="/nutritional-feedback">
						<u>nutritional feedback</u>
					</Link>
					<Link href="/analysis">
						<u>Analysis</u>
					</Link>
				</div>
			</main>
		</div>
	);
}
