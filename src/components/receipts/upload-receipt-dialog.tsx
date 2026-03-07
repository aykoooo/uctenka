"use client";

import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileIcon, Loader2 } from "lucide-react";

export function UploadReceiptDialog() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Mock successful upload and extraction process started
            console.log("Mock uploaded:", file.name);

            // Close dialog
            setOpen(false);
            setFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Nahrát účtenku
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nahrát novou účtenku</DialogTitle>
                    <DialogDescription>
                        Nahrajte PDF, JPG nebo PNG k okamžitému vytěžení dat.
                    </DialogDescription>
                </DialogHeader>

                <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                    />

                    {file ? (
                        <div className="flex flex-col items-center gap-2">
                            <FileIcon className="h-10 w-10 text-primary" />
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Klikněte nebo přetáhněte soubor sem</p>
                            <p className="text-xs text-muted-foreground">Podporované formáty: PDF, JPG, PNG</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isUploading}>
                        Zrušit
                    </Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isUploading ? "Nahrávám..." : "Nahrát a vytěžit"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
