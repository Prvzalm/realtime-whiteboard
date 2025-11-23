import { notFound } from "next/navigation";
import { SpectatorExperience } from "@/components/board/spectator-experience";
import { getBoardByShare } from "@/lib/services/board-service";

interface SharePageProps {
  params: Promise<{ shareId: string }>;
}

export default async function ShareBoardPage({ params }: SharePageProps) {
  const { shareId } = await params;
  const payload = await getBoardByShare(shareId).catch(() => null);
  if (!payload) {
    notFound();
  }

  return (
    <SpectatorExperience
      board={payload.board}
      snapshot={payload.snapshot}
      shareId={shareId}
    />
  );
}
