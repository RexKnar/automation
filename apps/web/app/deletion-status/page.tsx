import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

function DeletionStatusContent({ searchParams }: { searchParams: { id?: string } }) {
    const id = searchParams.id;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Data Deletion Request</CardTitle>
                    <CardDescription>
                        Your request has been received and is being processed.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-gray-100 p-4 text-center">
                        <p className="text-sm text-gray-500">Confirmation Code</p>
                        <p className="mt-1 font-mono text-lg font-medium text-gray-900">
                            {id || 'N/A'}
                        </p>
                    </div>
                    <p className="text-center text-sm text-gray-500">
                        Please save this confirmation code for your records. You can use this code to track the status of your data deletion request.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function DeletionStatusPage({ searchParams }: { searchParams: { id?: string } }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DeletionStatusContent searchParams={searchParams} />
        </Suspense>
    );
}
