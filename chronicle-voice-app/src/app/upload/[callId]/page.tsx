import PhotoUpload from "@/components/photo-upload";

// Define the props type for this page
// Define the props type for this page
export default async function UploadPage({
  params,
}: {
  params: Promise<{ callId: string }>;
}) {
  const { callId } = await params;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Upload Photos for Call #{callId}
      </h1>
      <p className="text-gray-500 mb-8">
        Add photos related to your call. You can select multiple photos at once.
      </p>

      <PhotoUpload callId={callId} />
    </div>
  );
}
