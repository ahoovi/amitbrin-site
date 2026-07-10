// amitbrin.com homepage — the tearable-paper entrance.
// The entrance text lives inside TearEntrance (it renders the plain,
// selectable page and hides the tear easter egg in the curled corner).
// The one-pager (/site) renders live beneath and is revealed at 65% torn.
import TearEntrance from "../components/TearEntrance";

export default function Home() {
  return <TearEntrance />;
}
