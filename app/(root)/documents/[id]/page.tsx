import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params }: { params: { id: string } }) => {
  const clerkUser = await currentUser();
  const { id } = await params;
  if (!clerkUser) redirect("/sign-in");

  const room = (await getDocument({
    roomId: id as string,
    userId: clerkUser.emailAddresses[0].emailAddress as string,
  })) as {
    metadata: any;
    usersAccesses: { [email: string]: string[] };
  };

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  const usersData = users
    ?.filter((user): user is User => user !== undefined)
    .map((user: User) => ({
      ...user,
      userType: room.usersAccesses[user.email]?.includes("room:write")
        ? "editor"
        : ("viewer" as UserType),
    }));

  const currentUserType = room.usersAccesses[
    clerkUser.emailAddresses[0].emailAddress
  ]?.includes("room:write")
    ? "editor"
    : "viewer";

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData || []}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
