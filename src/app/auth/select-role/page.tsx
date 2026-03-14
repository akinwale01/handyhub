import { Suspense } from "react";
import SelectRoleClient from "../../components/SelectRole";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SelectRoleClient />
    </Suspense>
  );
}