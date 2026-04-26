import { Suspense } from "react";
import { PotSplitter } from "./_components/PotSplitter";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <PotSplitter />
    </Suspense>
  );
}
