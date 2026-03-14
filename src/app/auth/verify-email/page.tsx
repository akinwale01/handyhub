import { Suspense } from "react";
import VerifyEmail from "../../components/VerifyEmail";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <VerifyEmail />
    </Suspense>
  );
}