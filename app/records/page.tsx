// import { Header } from '@/components/header'
// import { HealthRecords } from '@/components/health-records'
// import React from 'react'

// const page = () => {
//   return (
//     <div>
//         {/* <Header/> */}
//         <HealthRecords/>
//     </div>
//   )
// }

// export default page
"use client"

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, Share2, Download, Eye } from "lucide-react";

export default function DigitalHealthRecords() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const uploaded = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewFile(url);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-2">Digital Health Records</h1>
      <p className="text-gray-400 mb-6">
        Access your complete medical history, track vital signs, monitor health
        goals, and manage appointments all in one secure platform.
      </p>

      <Tabs defaultValue="records">
        <TabsList className="bg-gray-800 rounded-lg mb-6">
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="goals">Health Goals</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <div className="flex justify-end gap-3 mb-6">
          <Button variant="secondary" className="flex gap-2">
            <Download size={16} /> Export All
          </Button>
          <Button variant="secondary" className="flex gap-2">
            <Share2 size={16} /> Share
          </Button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 cursor-pointer">
            <Upload size={16} /> Upload Report
            <input
              type="file"
              accept=".pdf,.png,.jpg"
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <TabsContent value="records">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Example Record */}
            <Card className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg">
              <CardContent className="p-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    Complete Blood Count (CBC)
                  </h2>
                  <span className="text-xs bg-green-700 px-2 py-1 rounded-full">
                    Normal
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  All blood parameters within normal range
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  📅 2024-01-15 · Dr. Sarah Johnson
                </p>
                <Button variant="link" className="text-blue-400 mt-3 flex gap-1">
                  <Eye size={16} /> View
                </Button>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {files.map((file, idx) => (
              <Card
                key={idx}
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg"
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{file.name}</h2>
                    <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">
                      Uploaded
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {Math.round(file.size / 1024)} KB
                  </p>
                  <Button
                    variant="link"
                    className="text-blue-400 mt-3 flex gap-1"
                    onClick={() => handlePreview(file)}
                  >
                    <FileText size={16} /> Preview
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* PDF Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <iframe
              src={previewFile}
              className="w-full h-full rounded-lg border"
              title="PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
