import TearEntrance from "../../components/TearEntrance";

/* ═══════════════════════════════════════════════════════════════
   TEST ROUTE — /tear-test
   The tearable entrance experience, isolated for review.
   Nothing on / or /site is affected by this route.

   To promote after approval:
     1. Replace src/app/site/page.tsx with src/app/site2/page.tsx
        (the restructured one-pager), then delete site2.
     2. In src/components/TearEntrance.tsx change the import to
        "../app/site/page" and the skip link href to "/site".
     3. Replace src/app/page.tsx with:
          import TearEntrance from "../components/TearEntrance";
          export default function Home() { return <TearEntrance />; }
     4. Delete this tear-test folder.
═══════════════════════════════════════════════════════════════ */
export default function TearTest() {
  return <TearEntrance />;
}
